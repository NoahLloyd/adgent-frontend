import { Loader2 } from "lucide-react";

interface ScenesGenerationPanelProps {
  isGenerating: boolean;
  sceneUrls: string[];
}

export const ScenesGenerationPanel = ({ isGenerating, sceneUrls }: ScenesGenerationPanelProps) => {
  if (isGenerating) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <p className="text-sm text-muted-foreground">
            Generating scene images… this may take a few minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h3 className="text-lg font-semibold mb-4">Generated scenes</h3>
      {sceneUrls.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scenes generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sceneUrls.map((url, idx) => (
            <div key={idx} className="rounded-md border border-border overflow-hidden bg-muted">
              <img src={url} alt={`Scene ${idx + 1}`} className="w-full h-48 object-cover" />
              <div className="px-3 py-2 text-xs text-muted-foreground">Scene {idx + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


