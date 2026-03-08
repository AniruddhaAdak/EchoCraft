export interface HistoryEntry {
  id: string;
  createdAt: string;
  fileName: string;
  transcript: string;
}

const STORAGE_KEY = "echocraft-history";
const MAX_HISTORY_ITEMS = 8;

export const loadHistoryEntries = (): HistoryEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveHistoryEntries = (entries: HistoryEntry[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY_ITEMS)));
};

export const prependHistoryEntry = (entry: HistoryEntry, existingEntries: HistoryEntry[]) => {
  const nextEntries = [entry, ...existingEntries.filter((item) => item.transcript !== entry.transcript)];
  saveHistoryEntries(nextEntries);
  return nextEntries.slice(0, MAX_HISTORY_ITEMS);
};
