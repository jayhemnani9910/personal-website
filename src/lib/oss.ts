import fs from "fs";
import path from "path";
import { z } from "zod";
import { MERGED_PRS } from "@/data/home";

// The /oss pages: one JSON file per repo in content/oss, each pull request told
// in plain words. MERGED_PRS in data/home.ts stays the index the home receipts
// and the shell read (they ship to the browser; these write-ups do not), and
// oss.test.ts fails if the two ever list different pull requests.

const OSS_DIR = path.join(process.cwd(), "content", "oss");

const PrSchema = z.strictObject({
  number: z.number().int().positive(),
  /** The day it went in: GitHub's merge date, or the landed commit's for Modular. */
  merged: z.iso.date(),
  title: z.string().min(1),
  broken: z.string().min(1),
  changed: z.string().min(1),
  matters: z.string().min(1),
  /** One of the three the /oss card shows, for a repo with more than three. */
  top: z.literal(true).optional(),
});

const RepoSchema = z.strictObject({
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  about: z.string().min(1),
  /** The repo's GitHub stars, copied by hand: what the /oss "best" sort uses. */
  stars: z.number().int().nonnegative(),
  prs: z.array(PrSchema).min(1),
});

export type OssPr = z.infer<typeof PrSchema> & { href: string; landed?: string };
export type OssRepo = { slug: string; repo: string; about: string; stars: number; prs: OssPr[] };

/** The URL slug for a repo: "lightpanda-io/browser" -> "lightpanda-io-browser". */
export const ossSlug = (repo: string) => repo.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** How many pull requests a repo's /oss card shows before "see all". */
export const CARD_PRS = 3;

let cache: OssRepo[] | undefined;

/** Every repo, the busiest first; within one, the newest pull request first. */
export function getOssRepos(): OssRepo[] {
  if (cache) return cache;
  const landed = new Map(MERGED_PRS.map((pr) => [pr.href, pr.landed]));
  cache = fs
    .readdirSync(OSS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((file) => {
      const data = RepoSchema.parse(JSON.parse(fs.readFileSync(path.join(OSS_DIR, file), "utf8")));
      const slug = ossSlug(data.repo);
      if (file !== `${slug}.json`) throw new Error(`content/oss/${file}: name it ${slug}.json, after its repo`);
      const tops = data.prs.filter((pr) => pr.top).length;
      const wanted = data.prs.length > CARD_PRS ? CARD_PRS : 0;
      if (tops !== wanted) {
        throw new Error(`content/oss/${file}: ${tops} pull requests marked top, expected ${wanted}`);
      }
      const prs = data.prs
        .map((pr) => {
          const href = `https://github.com/${data.repo}/pull/${pr.number}`;
          return { ...pr, href, landed: landed.get(href) };
        })
        .toSorted((a, b) => b.merged.localeCompare(a.merged) || b.number - a.number);
      return { slug, repo: data.repo, about: data.about, stars: data.stars, prs };
    })
    .toSorted((a, b) => b.prs.length - a.prs.length || a.repo.localeCompare(b.repo));
  return cache;
}

export function getOssRepo(slug: string): OssRepo | undefined {
  return getOssRepos().find((r) => r.slug === slug);
}

/** What a repo's /oss card lists: its three top picks, or all of a small repo's. */
export function cardPrs(repo: OssRepo): OssPr[] {
  return repo.prs.length > CARD_PRS ? repo.prs.filter((pr) => pr.top) : repo.prs;
}

/** "15 merged", or "3 landed" for a repo that takes work in as commits. */
export const countLabel = (prs: { landed?: string }[]) =>
  `${prs.length} ${prs.every((pr) => pr.landed) ? "landed" : "merged"}`;
