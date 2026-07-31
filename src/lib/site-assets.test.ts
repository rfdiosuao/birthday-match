import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../", import.meta.url));

describe("public discovery assets", () => {
  it("publishes a robots policy that protects private areas", () => {
    const robots = readFileSync(`${root}public/robots.txt`, "utf8");
    expect(robots).toContain("Sitemap: https://birthday.heang.top/sitemap.xml");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /api/");
  });

  it("publishes the public legal and safety pages in the sitemap", () => {
    const sitemap = readFileSync(`${root}public/sitemap.xml`, "utf8");
    expect(sitemap).toContain("https://birthday.heang.top/privacy");
    expect(sitemap).toContain("https://birthday.heang.top/safety");
    expect(sitemap).toContain("https://birthday.heang.top/support");
  });
});
