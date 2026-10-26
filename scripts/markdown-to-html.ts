// One-off: converts product descriptions and blog articles written in Markdown to the editor's HTML.
// Safe to re-run: content that is already HTML is left as is. Usage: npx tsx scripts/markdown-to-html.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { isHtml, richTextHtml } from "../src/lib/richtext";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const convert = (s: string) => (s.trim() && !isHtml(s) ? richTextHtml(s) : s);

async function main() {
  let changed = 0;
  for (const p of await db.product.findMany({ select: { id: true, descFr: true, descAr: true } })) {
    const data = { descFr: convert(p.descFr), descAr: convert(p.descAr) };
    if (data.descFr !== p.descFr || data.descAr !== p.descAr) {
      await db.product.update({ where: { id: p.id }, data });
      changed++;
    }
  }
  for (const p of await db.blogPost.findMany({ select: { id: true, contentFr: true, contentAr: true } })) {
    const data = { contentFr: convert(p.contentFr), contentAr: convert(p.contentAr) };
    if (data.contentFr !== p.contentFr || data.contentAr !== p.contentAr) {
      await db.blogPost.update({ where: { id: p.id }, data });
      changed++;
    }
  }
  console.log(`${changed} row(s) converted to HTML.`);
}

main().finally(() => db.$disconnect());
