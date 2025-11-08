import { ProcessingStep } from "@/types/ad";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStepsProps {
  steps: ProcessingStep[];
}

export const ProcessingSteps = ({ steps }: ProcessingStepsProps) => {
  return (
    <div className="w-full py-2">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm",
              step.status === "complete" && "bg-muted/50 border-border",
              step.status === "processing" && "bg-muted border-foreground/20",
              step.status === "pending" &&
                "bg-background border-border opacity-70"
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
                <div className="w-3.5 h-3.5 rounded-full border border-border" />
              )}
            </div>
            <span
              className={cn(
                "text-sm leading-none",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
