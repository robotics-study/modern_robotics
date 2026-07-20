// 빌드 전에 public/sitemap.xml 을 생성한다. 챕터 목록은 pages/chapters/index.ts 에서
// `chapter: N` 패턴으로 읽으므로, 챕터를 추가하면 sitemap 도 자동으로 따라온다.
// 각 URL 에 en/ko hreflang 대체 링크를 함께 적는다.
import {readFileSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://robotics-study.github.io";
const BASE = "/modern_robotics/";

const indexTs = readFileSync(join(root, "src/pages/chapters/index.ts"), "utf-8");
const chapters = [...indexTs.matchAll(/chapter:\s*(\d+)/g)].map((m) => parseInt(m[1]));
if (chapters.length === 0) throw new Error("no chapters found in pages/chapters/index.ts");

const url = (lang, chapter) => {
    const params = new URLSearchParams();
    if (chapter !== undefined) params.set("chapter", String(chapter));
    if (lang === "ko") params.set("lang", "ko");
    const qs = params.toString();
    return `${ORIGIN}${BASE}${qs ? `?${qs}` : ""}`;
};

const esc = (s) => s.replaceAll("&", "&amp;");
const today = new Date().toISOString().slice(0, 10);

const entry = (lang, chapter, priority) => `  <url>
    <loc>${esc(url(lang, chapter))}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${esc(url("en", chapter))}"/>
    <xhtml:link rel="alternate" hreflang="ko" href="${esc(url("ko", chapter))}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(url("en", chapter))}"/>
  </url>`;

const entries = [
    entry("en", undefined, "1.0"),
    entry("ko", undefined, "1.0"),
    ...chapters.flatMap((n) => [entry("en", n, "0.8"), entry("ko", n, "0.8")]),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml);
console.log(`sitemap.xml: ${entries.length} URLs (chapters: ${chapters.join(", ")})`);
