import fetch from 'node-fetch';
import Parser from 'rss-parser';
import { writeFile } from 'fs/promises';
import { mkdir, stat } from 'fs/promises';
import path from 'node:path';

const FEED_URL = 'https://aisafetycapetown.substack.com/feed';
const OUT_DIR = 'src/assets/data';
const OUT_FILE = 'newsletters.json';

async function ensureDir(dir) {
  try {
    await stat(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

async function main() {
  const parser = new Parser({
    requestOptions: { timeout: 15_000 },
  });

  const feedXml = await (await fetch(FEED_URL)).text();
  const feed = await parser.parseString(feedXml);

  const cleaned = feed.items.map((it) => ({
    title: it.title ?? 'Untitled',
    link: it.link,
    pubDate: it.pubDate,
    // Try several Substack image fields in order of likelihood
    image: it.enclosure?.url ?? it['substack:featured_image'] ?? it.thumbnail ?? null,
    excerpt: (it.contentSnippet ?? '').replace(/\s+/g, ' ').trim(),
  }));

  cleaned.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());

  await ensureDir(OUT_DIR);
  const outPath = path.join(OUT_DIR, OUT_FILE);
  await writeFile(outPath, JSON.stringify(cleaned, null, 2), 'utf8');

  console.log(`Wrote ${cleaned.length} items → ${outPath}`);
}

main().catch((e) => {
  console.error('Failed to fetch Substack feed:', e);
  process.exit(1);
});
