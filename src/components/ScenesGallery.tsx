import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { ChevronDown, ChevronRight, RefreshCcw } from "lucide-react";

type Scene = {
  scene_description: string;
  voice_over_text: string;
};

interface ScenesGalleryProps {
  imageUrls: string[];
  scenes: Scene[];
  onRegenerate: (sceneIndex: number, prompt: string) => Promise<void>;
  onCreateVideo: () => void;
}

export const ScenesGallery = ({ imageUrls, scenes, onRegenerate, onCreateVideo }: ScenesGalleryProps) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [prompts, setPrompts] = useState<Record<number, string>>({});
  const [isRegen, setIsRegen] = useState<Record<number, boolean>>({});

  const initialPrompts = useMemo(() => {
    const map: Record<number, string> = {};
    scenes.forEach((s, i) => {
      map[i + 1] = `Generate a cinematic PNG image depicting the scene below with consistent lighting and style.\nScene description: ${s.scene_description}`;
    });
    return map;
  }, [scenes]);

  const getPrompt = (idx: number) => {
    return prompts[idx] ?? initialPrompts[idx] ?? "";
  };

  const toggle = (idx: number) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

  const regen = async (idx: number) => {
    const prompt = getPrompt(idx);
    try {
      setIsRegen(prev => ({ ...prev, [idx]: true }));
      await onRegenerate(idx, prompt);
    } finally {
      setIsRegen(prev => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 space-y-6">
      <h2 className="text-xl font-semibold">Generated scenes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {imageUrls.map((url, index) => {
          const sceneIdx = index + 1;
          const scene = scenes[index];
          const isOpen = !!expanded[sceneIdx];
          return (
            <Card key={sceneIdx} className="border-border overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm">Scene {sceneIdx}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toggle(sceneIdx)} className="gap-1">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {isOpen ? "Hide details" : "Details"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <img src={url} alt={`Scene ${sceneIdx}`} className="w-full h-48 object-cover rounded-md" />
                {isOpen && scene && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Voice-over</div>
                      <div className="text-sm">{scene.voice_over_text}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Prompt</div>
                      <Textarea
                        value={getPrompt(sceneIdx)}
                        onChange={(e) => setPrompts(prev => ({ ...prev, [sceneIdx]: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <Button size="sm" onClick={() => regen(sceneIdx)} disabled={!!isRegen[sceneIdx]} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        {isRegen[sceneIdx] ? "Regenerating..." : "Regenerate image"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-center pt-4">
        <Button size="lg" className="h-11 px-6" onClick={onCreateVideo}>
          Create video
        </Button>
      </div>
    </div>
  );
};


