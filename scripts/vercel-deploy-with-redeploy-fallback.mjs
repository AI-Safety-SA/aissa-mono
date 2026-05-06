#!/usr/bin/env node

import { appendFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const deployArgs = process.argv.slice(2);

if (deployArgs.length === 0) {
  console.error(
    "Usage: vercel-deploy-with-redeploy-fallback.mjs <vercel deploy args...>",
  );
  process.exit(1);
}

function runDeploy(args) {
  return new Promise((resolve) => {
    const child = spawn("pnpm", ["dlx", "vercel", "deploy", ...args], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on("close", (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseOriginalDeploymentId(output) {
  const inspectMatch = output.match(
    /Inspect:\s+https:\/\/vercel\.com\/\S+\/([A-Za-z0-9]+)(?:\s|\[|$)/,
  );
  const rawId = inspectMatch?.[1];

  if (!rawId) return undefined;
  return rawId.startsWith("dpl_") ? rawId : `dpl_${rawId}`;
}

function parseDeploymentUrl(output) {
  const readyUrlMatch = output.match(
    /(?:Preview|Production):\s+(https:\/\/[^\s]+\.vercel\.app)(?:\s|\[|$)/,
  );
  return readyUrlMatch?.[1];
}

async function fetchDeployments() {
  const { VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID } = process.env;

  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error(
      "VERCEL_TOKEN and VERCEL_PROJECT_ID are required for redeploy fallback",
    );
  }

  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("projectId", VERCEL_PROJECT_ID);
  url.searchParams.set("limit", "20");

  if (VERCEL_ORG_ID) {
    url.searchParams.set("teamId", VERCEL_ORG_ID);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Vercel deployments API failed with ${response.status}: ${body}`,
    );
  }

  const body = await response.json();
  return Array.isArray(body.deployments) ? body.deployments : [];
}

async function fetchDeploymentAliases(deploymentId) {
  const { VERCEL_TOKEN, VERCEL_ORG_ID } = process.env;

  if (!VERCEL_TOKEN) {
    throw new Error("VERCEL_TOKEN is required to resolve deployment aliases");
  }

  const url = new URL(
    `https://api.vercel.com/v2/deployments/${deploymentId}/aliases`,
  );

  if (VERCEL_ORG_ID) {
    url.searchParams.set("teamId", VERCEL_ORG_ID);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Vercel aliases API failed with ${response.status}: ${body}`,
    );
  }

  const body = await response.json();
  return Array.isArray(body.aliases) ? body.aliases : [];
}

function normalizeHost(value) {
  if (!value) return undefined;
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function chooseBranchAlias(aliases, deploymentUrl) {
  const deploymentHost = normalizeHost(deploymentUrl);
  const aliasHosts = aliases
    .map((entry) => normalizeHost(entry.alias))
    .filter(Boolean);

  const branchAlias = aliasHosts.find(
    (host) =>
      host !== deploymentHost &&
      host.endsWith(".vercel.app") &&
      host.includes("-git-"),
  );

  if (branchAlias) return branchAlias;

  return aliasHosts.find(
    (host) => host !== deploymentHost && host.endsWith(".vercel.app"),
  );
}

async function waitForBranchAlias(deployment) {
  const attempts = Number.parseInt(
    process.env.VERCEL_ALIAS_OUTPUT_ATTEMPTS ?? "12",
    10,
  );
  const intervalMs = Number.parseInt(
    process.env.VERCEL_ALIAS_OUTPUT_INTERVAL_MS ?? "5000",
    10,
  );

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const aliases = await fetchDeploymentAliases(deployment.id);
    const branchAlias = chooseBranchAlias(aliases, deployment.url);

    if (branchAlias) {
      return `https://${branchAlias}`;
    }

    console.log(
      `Branch alias resolution attempt ${attempt}/${attempts}: no branch alias assigned yet.`,
    );

    if (attempt < attempts) {
      await sleep(intervalMs);
    }
  }

  throw new Error(`No branch alias found for deployment ${deployment.id}`);
}

async function writeGithubOutputs(outputs) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;

  const lines = Object.entries(outputs)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  if (lines) {
    await appendFile(outputPath, `${lines}\n`);
  }
}

async function emitDeploymentOutputs(deployment) {
  if (!process.env.VERCEL_OUTPUT_BRANCH_ALIAS) return;

  const branchUrl = await waitForBranchAlias(deployment);
  const deploymentUrl = deployment.url
    ? `https://${normalizeHost(deployment.url)}`
    : undefined;

  console.log(`Resolved branch preview URL: ${branchUrl}`);

  await writeGithubOutputs({
    branch_url: branchUrl,
    branch_api_base_url: branchUrl,
    deployment_url: deploymentUrl,
  });
}

function findReplacementDeployment(deployments, originalDeploymentId) {
  const commitSha = process.env.GIT_COMMIT_SHA;

  return deployments.find((deployment) => {
    const meta = deployment.meta ?? {};
    const referencesOriginal =
      meta.originalDeploymentId === originalDeploymentId ||
      meta.neonPreviousDeploymentId === originalDeploymentId;
    const matchesCommit = !commitSha || meta.githubCommitSha === commitSha;

    return referencesOriginal && matchesCommit;
  });
}

async function waitForReplacementDeployment(originalDeploymentId) {
  const attempts = Number.parseInt(
    process.env.VERCEL_REDEPLOY_FALLBACK_ATTEMPTS ?? "72",
    10,
  );
  const intervalMs = Number.parseInt(
    process.env.VERCEL_REDEPLOY_FALLBACK_INTERVAL_MS ?? "5000",
    10,
  );

  console.log(
    `Vercel canceled ${originalDeploymentId}; waiting for an integration-created redeploy...`,
  );

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const deployments = await fetchDeployments();
    const replacement = findReplacementDeployment(
      deployments,
      originalDeploymentId,
    );

    if (!replacement) {
      console.log(
        `Redeploy fallback attempt ${attempt}/${attempts}: no replacement yet.`,
      );
    } else {
      const deploymentUrl = replacement.url
        ? `https://${replacement.url}`
        : replacement.id;
      console.log(
        `Redeploy fallback attempt ${attempt}/${attempts}: ${replacement.id} is ${replacement.state} (${deploymentUrl}).`,
      );

      if (replacement.state === "READY") {
        console.log(`Replacement deployment is ready: ${deploymentUrl}`);
        return replacement;
      }

      if (replacement.state === "ERROR" || replacement.state === "CANCELED") {
        throw new Error(
          `Replacement deployment ${replacement.id} ended as ${replacement.state}`,
        );
      }
    }

    if (attempt < attempts) {
      await sleep(intervalMs);
    }
  }

  return undefined;
}

const { code, output } = await runDeploy(deployArgs);

if (code === 0) {
  const deploymentId = parseOriginalDeploymentId(output);

  if (!deploymentId && process.env.VERCEL_OUTPUT_BRANCH_ALIAS) {
    console.error("Deployment succeeded, but the deployment ID was not found.");
    process.exit(1);
  }

  try {
    await emitDeploymentOutputs({
      id: deploymentId,
      url: parseDeploymentUrl(output),
    });
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (!output.includes("The deployment has been canceled.")) {
  process.exit(code);
}

const originalDeploymentId = parseOriginalDeploymentId(output);

if (!originalDeploymentId) {
  console.error(
    "Vercel deployment was canceled, but the original deployment ID was not found.",
  );
  process.exit(code);
}

try {
  const replacementDeployment =
    await waitForReplacementDeployment(originalDeploymentId);
  if (!replacementDeployment) {
    process.exit(code);
  }

  await emitDeploymentOutputs(replacementDeployment);
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(code);
}
