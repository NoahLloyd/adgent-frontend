import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMemo } from "react";

interface StoryboardPanelProps {
  prompt: string;
  generatedText: string;
  model?: string;
  onRegenerate: () => void;
}

export const StoryboardPanel = ({
  prompt,
  generatedText,
  model,
  onRegenerate,
}: StoryboardPanelProps) => {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(generatedText);
    } catch {
      return null;
    }
  }, [generatedText]);

  return (
    <div className="w-full">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Storyboard</CardTitle>
            <div className="flex items-center gap-2">
              {model ? (
                <span className="text-xs text-muted-foreground">
                  Model: {model}
                </span>
              ) : null}
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                Regenerate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {parsed ? (
            <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md overflow-x-auto">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          ) : (
            <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md overflow-x-auto">
              {generatedText}
            </pre>
          )}
        </CardContent>
      </Card>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">
          Tip: Click Regenerate to load the exact prompt used, edit it, and
          press Enter to refine the storyboard.
        </p>
      </div>
    </div>
  );
};
