import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";

export type StoryboardScene = {
  scene_description: string;
  voice_over_text: string;
};

interface StoryboardPanelProps {
  scenes: StoryboardScene[];
  onScenesChange: (scenes: StoryboardScene[]) => void;
  onGenerateScenes: () => void;
  model?: string;
  assetsUploader?: React.ReactNode;
}

export const StoryboardPanel = ({
  scenes,
  onScenesChange,
  onGenerateScenes,
  model,
  assetsUploader,
}: StoryboardPanelProps) => {
  const updateScene = (index: number, patch: Partial<StoryboardScene>) => {
    const next = scenes.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onScenesChange(next);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Storyboard</h3>
        {model ? (
          <span className="text-xs text-muted-foreground">Model: {model}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenes.map((scene, index) => (
          <Card key={index} className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Scene {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Scene description
                </label>
                <Textarea
                  value={scene.scene_description}
                  onChange={(e) =>
                    updateScene(index, { scene_description: e.target.value })
                  }
                  className="min-h-[88px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Voice-over
                </label>
                <Textarea
                  value={scene.voice_over_text}
                  onChange={(e) =>
                    updateScene(index, { voice_over_text: e.target.value })
                  }
                  className="min-h-[72px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assetsUploader}

      <div className="flex items-center justify-center">
        <Button size="lg" className="h-11 px-6" onClick={onGenerateScenes}>
          Generate scenes
        </Button>
      </div>
    </div>
  );
};
