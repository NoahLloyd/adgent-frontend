import { GenerateAdIdeasRequest, AdIdea } from "@/types/ad";

export const API_BASE_URL = "http://127.0.0.1:8000";

export async function generateAdIdeas(
  request: GenerateAdIdeasRequest
): Promise<AdIdea[]> {
  const response = await fetch(`${API_BASE_URL}/generate-ad-ideas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

export function extractUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches[0] : null;
}

export async function generateStoryboard(selectedIdea: string): Promise<any> {
  const url = new URL(`${API_BASE_URL}/generate-story-board`);
  url.searchParams.set("selected_idea", selectedIdea);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: null,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

export async function uploadCharAsset(
  file: File
): Promise<{ success: boolean; filename: string; path: string }> {
  const form = new FormData();
  form.append("image", file);
  const response = await fetch(`${API_BASE_URL}/upload-char-asset`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return await response.json();
}

export async function generateScenes(
  storyboard: Array<{ scene_description: string; voice_over_text: string }>
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/generate-scenes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storyboard }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return await response.json();
}

export async function regenerateScene(
  sceneIndex: number,
  prompt: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/regenerate-scene`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scene_index: sceneIndex, prompt }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return await response.json();
}

export async function generateVoiceovers(voiceId?: string): Promise<any> {
  const url = new URL(`${API_BASE_URL}/generate-voiceovers`);
  if (voiceId) {
    url.searchParams.set("voice_id", voiceId);
  }
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return await response.json();
}

export async function generateVideos(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/generate-videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return await response.json();
}

export async function generateFinalVideo(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/generate_final_video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return await response.json().catch(() => ({}));
}
