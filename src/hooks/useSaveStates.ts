export type AppState = {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  adIdeas: Array<{ title: string; description: string; image: string }>;
  selectedIdeaIndex: number | null;
  companyUrl: string;
  storyboardResult: { prompt: string; generated_text: string; model?: string } | null;
  storyboardScenes: Array<{ scene_description: string; voice_over_text: string }> | null;
  lastStoryboardText: string;
};

export type SavedStateMeta = {
  id: string;
  name: string;
  createdAt: string; // ISO
};

const STORAGE_KEY = "adgent.saveStates";

type SavedEntry = SavedStateMeta & { data: AppState };

function readAll(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function writeAll(entries: SavedEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function listStates(): SavedStateMeta[] {
  return readAll().map(({ id, name, createdAt }) => ({ id, name, createdAt }));
}

export function saveState(name: string, data: AppState): string {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const entries = readAll();
  entries.unshift({ id, name, createdAt, data });
  writeAll(entries);
  return id;
}

export function loadState(id: string): AppState | null {
  const entries = readAll();
  const found = entries.find((e) => e.id === id);
  return found ? found.data : null;
}

export function deleteState(id: string): void {
  const entries = readAll().filter((e) => e.id !== id);
  writeAll(entries);
}


