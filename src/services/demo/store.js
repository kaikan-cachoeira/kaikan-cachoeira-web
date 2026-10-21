import { createSeed } from "./seed";
import { readJSON, writeJSON } from "../../utils/storage";

const STORAGE_KEY = "kaikan-cachoeira-demo-db";
const DB_VERSION = 1;

let memoryDb = null;

export function getDb() {
  if (memoryDb) return memoryDb;
  const stored = readJSON(STORAGE_KEY, null);
  if (stored && stored.version === DB_VERSION) {
    memoryDb = stored;
  } else {
    memoryDb = createSeed();
    persistDb();
  }
  return memoryDb;
}

export function persistDb() {
  if (memoryDb) writeJSON(STORAGE_KEY, memoryDb);
}

export function resetDb() {
  memoryDb = createSeed();
  persistDb();
  return memoryDb;
}
