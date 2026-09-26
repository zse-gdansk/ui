import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BADGE_START = "<!-- react-doctor-badge:start -->";
const BADGE_END = "<!-- react-doctor-badge:end -->";

function scoreColorHex(score: number): string {
    if (score >= 100) return "22C55E";
    if (score >= 90) return "16A34A";
    if (score >= 80) return "84CC16";
    if (score >= 70) return "EAB308";
    if (score >= 50) return "F97316";
    return "EF4444";
}

function buildShieldcnBadgeUrl(score: number): string {
    const message = encodeURIComponent(`${score}/100`);
    const color = scoreColorHex(score);
    return `https://shieldcn.dev/badge/React_Doctor-${message}-${color}.png?logo=react&variant=secondary&size=sm`;
}

function buildReadmeBadgeLine(score: number): string {
    const url = buildShieldcnBadgeUrl(score);
    return `[![React Doctor](${url})](https://react.doctor)`;
}

function readScoreFromCli(): number {
    const result = spawnSync(
        "react-doctor",
        ["--yes", "--score", "--no-color", "--project", "@zse-gdansk/ui"],
        {
            encoding: "utf8",
            cwd: join(dirname(fileURLToPath(import.meta.url)), ".."),
        },
    );

    if (result.status !== 0) {
        const stderr = result.stderr?.trim();
        throw new Error(stderr || "react-doctor --score failed");
    }

    const score = Number(result.stdout.trim());
    if (!Number.isFinite(score)) {
        throw new Error(`Invalid react-doctor score: ${result.stdout.trim()}`);
    }

    return score;
}

const scoreArg = process.argv[2];
const score = scoreArg ? Number(scoreArg) : readScoreFromCli();

if (!Number.isFinite(score)) {
    throw new Error(`Invalid score argument: ${scoreArg}`);
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = join(repoRoot, "README.md");
const readme = readFileSync(readmePath, "utf8");

const badgeBlock = `${BADGE_START}\n${buildReadmeBadgeLine(score)}\n${BADGE_END}`;

if (!readme.includes(BADGE_START) || !readme.includes(BADGE_END)) {
    throw new Error(
        `README.md is missing ${BADGE_START} / ${BADGE_END} markers`,
    );
}

const updatedReadme = readme.replace(
    new RegExp(`${BADGE_START}[\\s\\S]*?${BADGE_END}`),
    badgeBlock,
);

if (updatedReadme === readme) {
    console.log(`README.md already has React Doctor ${score}/100`);
    process.exit(0);
}

writeFileSync(readmePath, updatedReadme);

console.log(`Updated ${readmePath} (React Doctor ${score}/100)`);
