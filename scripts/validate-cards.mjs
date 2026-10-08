// Validates data/cards.json: 78 unique cards, required bilingual fields,
// correct arcana/suit distribution, and that every image file exists.
// Run: npm run validate:cards (exit 1 on any failure)
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cards = JSON.parse(readFileSync(join(root, "data/cards.json"), "utf8"));

const errors = [];
const fail = (msg) => errors.push(msg);

const TEXT_FIELDS = [
  "name_en",
  "name_vi",
  "upright_en",
  "upright_vi",
  "reversed_en",
  "reversed_vi",
];

if (!Array.isArray(cards)) fail("cards.json root must be an array");
if (cards.length !== 78) fail(`expected 78 cards, got ${cards.length}`);

const ids = new Set();
const arcanaCount = { major: 0, minor: 0 };
const suitCount = { wands: 0, cups: 0, swords: 0, pentacles: 0 };

for (const [i, c] of cards.entries()) {
  const tag = `cards[${i}] (${c.id ?? "no-id"})`;
  if (!c.id || typeof c.id !== "string") fail(`${tag}: missing id`);
  if (ids.has(c.id)) fail(`${tag}: duplicate id`);
  ids.add(c.id);

  if (c.arcana === "major") {
    arcanaCount.major++;
    if (c.suit !== null) fail(`${tag}: major arcana must have suit=null`);
    if (!Number.isInteger(c.number) || c.number < 0 || c.number > 21)
      fail(`${tag}: major number must be 0-21`);
    if (c.id !== `major-${String(c.number).padStart(2, "0")}`)
      fail(`${tag}: id must match number (major-NN)`);
  } else if (c.arcana === "minor") {
    arcanaCount.minor++;
    if (!suitCount.hasOwnProperty(c.suit))
      fail(`${tag}: invalid suit ${c.suit}`);
    else suitCount[c.suit]++;
    if (!Number.isInteger(c.number) || c.number < 1 || c.number > 14)
      fail(`${tag}: minor number must be 1-14`);
    if (c.id !== `${c.suit}-${String(c.number).padStart(2, "0")}`)
      fail(`${tag}: id must match suit-number`);
  } else {
    fail(`${tag}: invalid arcana ${c.arcana}`);
  }

  for (const f of TEXT_FIELDS) {
    if (typeof c[f] !== "string" || c[f].trim().length === 0)
      fail(`${tag}: missing/empty ${f}`);
  }
  for (const f of ["keywords_en", "keywords_vi"]) {
    if (!Array.isArray(c[f]) || c[f].length < 2 || c[f].some((k) => typeof k !== "string" || !k.trim()))
      fail(`${tag}: ${f} must be an array of >=2 non-empty strings`);
  }

  if (typeof c.image !== "string" || !c.image.startsWith("/cards/"))
    fail(`${tag}: image must be a /cards/... path`);
  else {
    const p = join(root, "public", c.image);
    if (!existsSync(p)) fail(`${tag}: image file missing ${c.image}`);
    else if (statSync(p).size < 5000) fail(`${tag}: image too small ${c.image}`);
  }
}

if (arcanaCount.major !== 22) fail(`expected 22 major, got ${arcanaCount.major}`);
if (arcanaCount.minor !== 56) fail(`expected 56 minor, got ${arcanaCount.minor}`);
for (const [s, n] of Object.entries(suitCount)) {
  if (n !== 14) fail(`expected 14 ${s}, got ${n}`);
}

if (errors.length > 0) {
  console.error(`cards.json INVALID (${errors.length} errors):`);
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}
console.log("cards.json VALID: 78 cards (22 major + 56 minor), all fields + images OK");
