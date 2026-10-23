import { createSeed } from "./dadosIniciais";
import { lerJSON, salvarJSON } from "@/shared/lib/armazenamentoLocal";

const STORAGE_KEY = "kaikan-cachoeira-demo-db";
const DB_VERSION = 1;

let memoryDb: any = null;

export function getDb() {
  if (memoryDb) return memoryDb;
  const stored = lerJSON<{ version?: number } | null>(STORAGE_KEY, null);
  if (stored && stored.version === DB_VERSION) {
    memoryDb = stored;
  } else {
    memoryDb = createSeed();
    persistDb();
  }
  return memoryDb;
}

export function persistDb() {
  if (memoryDb) salvarJSON(STORAGE_KEY, memoryDb);
}

export function resetDb() {
  memoryDb = createSeed();
  persistDb();
  return memoryDb;
}
