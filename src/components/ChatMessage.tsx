import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import type { ProcessingStep } from "@/types/ad";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  typing?: boolean;
  typingSpeedMsPerChar?: number;
  steps?: ProcessingStep[];
  fade?: boolean;
}

export const ChatMessage = ({ role, content, typing = false, typingSpeedMsPerChar = 18, steps, fade = false }: ChatMessageProps) => {
  const [displayed, setDisplayed] = useState<string>(typing ? "" : content);

  useEffect(() => {
    if (!typing) {
      setDisplayed(content);
      return;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(content.slice(0, i));
      if (i >= content.length) clearInterval(interval);
    }, typingSpeedMsPerChar);
    return () => clearInterval(interval);
  }, [content, typing, typingSpeedMsPerChar]);

  return (
    <div className={cn(
      "flex w-full py-6",
      role === 'user' ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-lg transition-opacity duration-500",
        fade && "opacity-0",
        role === 'user' 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-foreground"
      )}>
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">{displayed}</p>
          {Array.isArray(steps) && steps.length > 0 && (
            <div className="flex flex-col gap-1">
              {(steps.filter(s => s.status !== "pending")).map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm fade-in",
                    step.status === "complete" && "bg-muted/50 border-border",
                    step.status === "processing" && "bg-muted border-foreground/20",
                    step.status === "pending" && "bg-background border-border opacity-70"
                  )}
                >
                  <div className="flex-shrink-0">
                    {step.status === "complete" && (
                      <Check className="w-3.5 h-3.5 text-foreground" />
                    )}
                    {step.status === "processing" && (
                      <Loader2 className="w-3.5 h-3.5 text-foreground animate-spin" />
                    )}
                    {step.status === "pending" && (
                      <div className="w-3.5 h-3.5 rounded-md border border-border" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm leading-none",
                      step.status === "pending" && "text-muted-foreground",
                      step.status === "processing" && "pulse-text"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
