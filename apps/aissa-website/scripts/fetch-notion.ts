import { Client } from '@notionhq/client';
import fs from 'node:fs/promises';
import { mkdir, stat } from 'fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;
const OUT_DIR = 'src/assets/data';
const OUT_FILE = 'notion-augment.json';

type NotionRow = {
  title: string;
  link: string;
  imageOverride?: string;
  description?: string;
};

function getText(rich: any[]): string {
  return rich.map((r) => r.plain_text ?? '').join('');
}

async function ensureDir(dir: string) {
  try {
    await stat(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

async function fetchAllPages() {
  const results: any[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const resp = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    results.push(...resp.results);
    if (!resp.has_more) break;
    cursor = resp.next_cursor ?? undefined;
  }
  return results;
}

async function getPageContent(pageId: string): Promise<string> {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
    });

    let content = '';
    for (const block of blocks.results) {
      if ('type' in block) {
        if (block.type === 'paragraph' && 'paragraph' in block && block.paragraph.rich_text) {
          content += getText(block.paragraph.rich_text) + '\n';
        } else if (
          block.type === 'bulleted_list_item' &&
          'bulleted_list_item' in block &&
          block.bulleted_list_item.rich_text
        ) {
          content += '• ' + getText(block.bulleted_list_item.rich_text) + '\n';
        } else if (
          block.type === 'numbered_list_item' &&
          'numbered_list_item' in block &&
          block.numbered_list_item.rich_text
        ) {
          content += getText(block.numbered_list_item.rich_text) + '\n';
        }
      }
    }
    return content.trim();
  } catch (error) {
    console.warn(`Failed to fetch content for page ${pageId}:`, error);
    return '';
  }
}

async function mapPage(p: any): Promise<NotionRow | null> {
  const props = p.properties;

  const title = getText(props['Title']?.title ?? []);
  const link = props['Link']?.url as string | undefined;
  const imageOverride = props['Image Override']?.url as string | undefined;

  if (!title || !link) return null;

  // Fetch the custom description from the page content
  const customDescription = await getPageContent(p.id);

  return {
    title,
    link,
    imageOverride: imageOverride || undefined,
    description: customDescription || undefined,
  };
}

async function main() {
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID is not set');
  }
  const pages = await fetchAllPages();

  // Map pages with async operations
  const rows: NotionRow[] = [];
  for (const page of pages) {
    const mapped = await mapPage(page);
    if (mapped) rows.push(mapped);
  }

  // Index by link for easy merging
  const byLink: Record<string, NotionRow> = {};
  for (const r of rows) byLink[r.link] = r;

  await ensureDir(OUT_DIR);
  const outPath = path.join(OUT_DIR, OUT_FILE);
  await fs.writeFile(outPath, JSON.stringify(byLink, null, 2), 'utf-8');

  console.log(`Wrote ${Object.keys(byLink).length} entries to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
