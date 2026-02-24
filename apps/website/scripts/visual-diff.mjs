import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const websiteDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(websiteDir, '..', '..');

const LIVE_BASE = process.env.LIVE_BASE ?? 'https://www.aisafetysa.com';
const LOCAL_BASE = process.env.LOCAL_BASE ?? 'http://localhost:4321';
const START_LOCAL_SERVER = process.env.START_LOCAL_SERVER !== 'false';
const VIEWPORT_WIDTH = Number.parseInt(process.env.VIEWPORT_WIDTH ?? '1664', 10);
const VIEWPORT_HEIGHT = Number.parseInt(process.env.VIEWPORT_HEIGHT ?? '935', 10);
const DIFF_THRESHOLD = Number.parseInt(process.env.DIFF_THRESHOLD ?? '25', 10);

const ROUTES = [
  { name: 'home', route: '/' },
  { name: 'about', route: '/about' },
  { name: 'team', route: '/team' },
  { name: 'blog', route: '/blog' },
  { name: 'get-involved', route: '/get-involved' },
];

function pickPnpmPackageDir(pkgName) {
  const pnpmDir = path.join(repoRoot, 'node_modules', '.pnpm');
  const dirs = fsSync
    .readdirSync(pnpmDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(`${pkgName}@`))
    .map((entry) => entry.name)
    .sort()
    .reverse();

  if (dirs.length === 0) {
    throw new Error(`Could not find pnpm package for ${pkgName} in ${pnpmDir}`);
  }

  return path.join(pnpmDir, dirs[0], 'node_modules', pkgName);
}

async function waitForUrl(url, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function normalizeRoute(route) {
  if (route === '/') return '';
  return route;
}

function fmtPct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

let localServer = null;

async function main() {
  const playwrightDir = pickPnpmPackageDir('playwright');
  const sharpDir = pickPnpmPackageDir('sharp');
  const { chromium } = await import(pathToFileURL(path.join(playwrightDir, 'index.mjs')).href);
  const sharp = (await import(pathToFileURL(path.join(sharpDir, 'lib', 'index.js')).href)).default;

  const runId = nowStamp();
  const outRoot = path.join(websiteDir, 'visual-diffs', runId);
  const localDir = path.join(outRoot, 'local');
  const liveDir = path.join(outRoot, 'live');
  const diffDir = path.join(outRoot, 'diff');
  await fs.mkdir(localDir, { recursive: true });
  await fs.mkdir(liveDir, { recursive: true });
  await fs.mkdir(diffDir, { recursive: true });

  if (START_LOCAL_SERVER) {
    localServer = spawn('pnpm', ['--filter', 'website', 'exec', 'astro', 'dev', '--host', 'localhost', '--port', '4321'], {
      cwd: repoRoot,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'development' },
    });

    const serverLog = path.join(outRoot, 'local-server.log');
    localServer.stdout.on('data', async (chunk) => {
      await fs.appendFile(serverLog, chunk.toString());
    });
    localServer.stderr.on('data', async (chunk) => {
      await fs.appendFile(serverLog, chunk.toString());
    });

    await waitForUrl(`${LOCAL_BASE}/`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
  });

  const report = {
    generatedAt: new Date().toISOString(),
    liveBase: LIVE_BASE,
    localBase: LOCAL_BASE,
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    threshold: DIFF_THRESHOLD,
    pages: [],
  };

  for (const pageDef of ROUTES) {
    const routeSuffix = normalizeRoute(pageDef.route);
    const localUrl = `${LOCAL_BASE}${routeSuffix}`;
    const liveUrl = `${LIVE_BASE}${routeSuffix}`;
    const localPath = path.join(localDir, `${pageDef.name}.png`);
    const livePath = path.join(liveDir, `${pageDef.name}.png`);
    const diffPath = path.join(diffDir, `${pageDef.name}.png`);

    const page = await context.newPage();
    await page.goto(localUrl, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.screenshot({ path: localPath, fullPage: true, animations: 'disabled' });
    await page.goto(liveUrl, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.screenshot({ path: livePath, fullPage: true, animations: 'disabled' });
    await page.close();

    const localMeta = await sharp(localPath).metadata();
    const liveMeta = await sharp(livePath).metadata();
    const width = Math.min(localMeta.width ?? 0, liveMeta.width ?? 0);
    const height = Math.min(localMeta.height ?? 0, liveMeta.height ?? 0);

    const localRaw = await sharp(localPath)
      .extract({ left: 0, top: 0, width, height })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const liveRaw = await sharp(livePath)
      .extract({ left: 0, top: 0, width, height })
      .ensureAlpha()
      .raw()
      .toBuffer();

    const diffRaw = Buffer.alloc(localRaw.length);
    let changedPixels = 0;
    let totalDelta = 0;
    const totalPixels = width * height;

    for (let i = 0; i < localRaw.length; i += 4) {
      const lr = localRaw[i];
      const lg = localRaw[i + 1];
      const lb = localRaw[i + 2];
      const rr = liveRaw[i];
      const rg = liveRaw[i + 1];
      const rb = liveRaw[i + 2];

      const delta = (Math.abs(lr - rr) + Math.abs(lg - rg) + Math.abs(lb - rb)) / 3;
      totalDelta += delta;
      if (delta > DIFF_THRESHOLD) {
        changedPixels += 1;
        diffRaw[i] = 255;
        diffRaw[i + 1] = 64;
        diffRaw[i + 2] = 140;
        diffRaw[i + 3] = 255;
      } else {
        const luminance = Math.round((lr + lg + lb) / 3);
        diffRaw[i] = luminance;
        diffRaw[i + 1] = luminance;
        diffRaw[i + 2] = luminance;
        diffRaw[i + 3] = 180;
      }
    }

    await sharp(diffRaw, { raw: { width, height, channels: 4 } }).png().toFile(diffPath);

    report.pages.push({
      name: pageDef.name,
      route: pageDef.route,
      localUrl,
      liveUrl,
      screenshots: {
        local: path.relative(websiteDir, localPath),
        live: path.relative(websiteDir, livePath),
        diff: path.relative(websiteDir, diffPath),
      },
      dimensions: {
        local: { width: localMeta.width, height: localMeta.height },
        live: { width: liveMeta.width, height: liveMeta.height },
        compared: { width, height },
      },
      changedPixels,
      totalPixels,
      mismatchRatio: changedPixels / totalPixels,
      meanDelta: totalDelta / totalPixels,
    });
  }

  await browser.close();

  report.pages.sort((a, b) => b.mismatchRatio - a.mismatchRatio);
  await fs.writeFile(path.join(outRoot, 'report.json'), JSON.stringify(report, null, 2));

  const lines = [
    '# Visual Diff Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Local base: ${report.localBase}`,
    `- Live base: ${report.liveBase}`,
    `- Viewport: ${report.viewport.width}x${report.viewport.height}`,
    `- Threshold: ${report.threshold}`,
    '',
    '| Page | Route | Mismatch | Mean Delta | Local (h) | Live (h) | Diff |',
    '|---|---|---:|---:|---:|---:|---|',
  ];
  for (const page of report.pages) {
    lines.push(
      `| ${page.name} | \`${page.route}\` | ${fmtPct(page.mismatchRatio)} | ${page.meanDelta.toFixed(2)} | ${page.dimensions.local.height} | ${page.dimensions.live.height} | \`${page.screenshots.diff}\` |`,
    );
  }
  await fs.writeFile(path.join(outRoot, 'summary.md'), `${lines.join('\n')}\n`);

  const latestLink = path.join(websiteDir, 'visual-diffs', 'latest');
  await fs.rm(latestLink, { force: true, recursive: true }).catch(() => {});
  await fs.symlink(outRoot, latestLink, 'dir');

  console.log(`Visual diffs complete: ${outRoot}`);
  console.log(`Latest symlink: ${latestLink}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (localServer && !localServer.killed) {
      localServer.kill('SIGTERM');
    }
  });
