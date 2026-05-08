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

function runVercel(args) {
  return new Promise((resolve) => {
    const child = spawn("pnpm", ["dlx", "vercel", ...args], {
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

function runDeploy(args) {
  return runVercel(["deploy", ...args]);
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

function normalizeDeploymentId(rawId) {
  if (!rawId) return undefined;
  return rawId.startsWith("dpl_") ? rawId : `dpl_${rawId}`;
}

function getDeploymentId(deployment) {
  return normalizeDeploymentId(deployment.id ?? deployment.uid);
}

function getDeploymentState(deployment) {
  return deployment.state ?? deployment.readyState;
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

async function fetchDeployment(idOrUrl) {
  const { VERCEL_TOKEN, VERCEL_ORG_ID } = process.env;

  if (!VERCEL_TOKEN) {
    throw new Error("VERCEL_TOKEN is required to fetch deployment details");
  }

  const deploymentRef = normalizeHost(idOrUrl);
  if (!deploymentRef) {
    throw new Error(
      "Deployment URL or ID is required to fetch deployment details",
    );
  }

  const url = new URL(
    `https://api.vercel.com/v13/deployments/${encodeURIComponent(deploymentRef)}`,
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
      `Vercel deployment API failed with ${response.status}: ${body}`,
    );
  }

  return response.json();
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

function getDeploymentUrl(deployment) {
  const host = normalizeHost(deployment.url);
  if (host) return `https://${host}`;

  return getDeploymentId(deployment);
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
  const deploymentId = getDeploymentId(deployment);

  if (!deploymentId) {
    throw new Error("Deployment ID is required to resolve branch aliases");
  }

  const attempts = Number.parseInt(
    process.env.VERCEL_ALIAS_OUTPUT_ATTEMPTS ?? "12",
    10,
  );
  const intervalMs = Number.parseInt(
    process.env.VERCEL_ALIAS_OUTPUT_INTERVAL_MS ?? "5000",
    10,
  );

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const aliases = await fetchDeploymentAliases(deploymentId);
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

  console.warn(`No branch alias found for deployment ${deploymentId}`);
  return undefined;
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

  const deploymentRef = getDeploymentUrl(deployment);
  const resolvedDeployment = getDeploymentId(deployment)
    ? deployment
    : await fetchDeployment(deploymentRef);
  const deploymentUrl = getDeploymentUrl(resolvedDeployment);
  const branchUrl = await waitForBranchAlias(resolvedDeployment);
  const previewUrl = branchUrl ?? deploymentUrl;

  if (branchUrl) {
    console.log(`Resolved branch preview URL: ${branchUrl}`);
  } else {
    console.log(`Using deployment URL as preview URL: ${deploymentUrl}`);
  }

  await writeGithubOutputs({
    branch_url: previewUrl,
    branch_api_base_url: previewUrl,
    deployment_url: deploymentUrl,
  });
}

async function waitWithVercelInspect(deploymentRef) {
  const { VERCEL_TOKEN } = process.env;

  if (!VERCEL_TOKEN) {
    throw new Error("VERCEL_TOKEN is required to wait for a deployment");
  }

  if (!deploymentRef) {
    throw new Error("Deployment URL or ID is required to wait for deployment");
  }

  const timeout = process.env.VERCEL_INSPECT_WAIT_TIMEOUT ?? "10m";
  const { code } = await runVercel([
    "inspect",
    deploymentRef,
    "--wait",
    `--timeout=${timeout}`,
    `--token=${VERCEL_TOKEN}`,
  ]);

  if (code !== 0) {
    throw new Error(`vercel inspect --wait failed for ${deploymentRef}`);
  }
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
    process.env.VERCEL_REDEPLOY_FALLBACK_ATTEMPTS ?? "24",
    10,
  );
  const intervalMs = Number.parseInt(
    process.env.VERCEL_REDEPLOY_FALLBACK_INTERVAL_MS ?? "5000",
    10,
  );

  console.log(
    `Vercel canceled ${originalDeploymentId}; waiting for an integration-created redeploy to appear...`,
  );

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const deployments = await fetchDeployments();
    const replacement = findReplacementDeployment(
      deployments,
      originalDeploymentId,
    );

    if (replacement) {
      const deploymentId = getDeploymentId(replacement);
      const deploymentState = getDeploymentState(replacement);
      const deploymentRef = getDeploymentUrl(replacement);

      console.log(
        `Replacement deployment found: ${deploymentId ?? deploymentRef} is ${deploymentState} (${deploymentRef}).`,
      );

      if (deploymentState === "READY") {
        return replacement;
      }

      if (deploymentState === "ERROR" || deploymentState === "CANCELED") {
        throw new Error(
          `Replacement deployment ${deploymentId ?? deploymentRef} ended as ${deploymentState}`,
        );
      }

      console.log(
        "Waiting for replacement deployment with vercel inspect --wait...",
      );
      await waitWithVercelInspect(deploymentRef);
      return replacement;
    }

    if (attempt === 1 || attempt === attempts || attempt % 6 === 0) {
      console.log(
        `Still waiting for replacement deployment (${attempt}/${attempts}).`,
      );
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
