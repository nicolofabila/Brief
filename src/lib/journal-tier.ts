/**
 * Maps journal names to a 0–1 tier using explicit substring rules (PubMed `journal` / full name).
 * Unknown journals get a neutral baseline so we do not fabricate per-article metrics.
 */

const TIER_HIGH = 1;
const TIER_MID = 0.65;
const TIER_DEFAULT = 0.4;

const HIGH_PATTERNS = [
  "nature",
  "science",
  "cell",
  "new england journal of medicine",
  "nejm",
  "the lancet",
  "lancet",
  "jama",
  "bmj",
  "british medical journal",
  "plos medicine",
  "proc natl acad sci",
  "pnas",
  "j clin invest",
  "journal of clinical investigation",
];

const MID_PATTERNS = [
  "circulation",
  "blood",
  "gut",
  "hepatology",
  "annals of internal medicine",
  "american journal of",
  "journal of clinical oncology",
  "european heart journal",
  "immunity",
  "neuron",
  "molecular cell",
  "cell metabolism",
  "cell reports",
  "nature medicine",
  "nature genetics",
  "nature biotechnology",
  "nature communications",
  "science advances",
  "science translational medicine",
  "jacc",
  "journal of the american college of cardiology",
  "diabetes care",
  "gastroenterology",
  "annals of neurology",
  "brain",
  "american journal of respiratory",
  "thorax",
  "chest",
  "intensive care medicine",
  "critical care medicine",
];

function normalizeJournalName(journal: string): string {
  return journal
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns a value in [0, 1] from fixed rules only. */
export function journalTierFromName(journal: string): number {
  const j = normalizeJournalName(journal);
  if (!j) return TIER_DEFAULT;
  for (const p of HIGH_PATTERNS) {
    if (j.includes(p)) return TIER_HIGH;
  }
  for (const p of MID_PATTERNS) {
    if (j.includes(p)) return TIER_MID;
  }
  return TIER_DEFAULT;
}
