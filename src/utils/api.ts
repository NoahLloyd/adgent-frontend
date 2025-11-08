import { GenerateAdIdeasRequest, AdIdea } from "@/types/ad";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function generateAdIdeas(request: GenerateAdIdeasRequest): Promise<AdIdea[]> {
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
