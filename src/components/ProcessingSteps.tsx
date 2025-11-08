import { ProcessingStep } from "@/types/ad";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStepsProps {
  steps: ProcessingStep[];
}

export const ProcessingSteps = ({ steps }: ProcessingStepsProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300",
              step.status === 'complete' && "bg-muted/50 border-border",
              step.status === 'processing' && "bg-muted border-foreground/20",
              step.status === 'pending' && "bg-background border-border opacity-50"
            )}
          >
            <div className="flex-shrink-0">
              {step.status === 'complete' && (
                <Check className="w-4 h-4 text-foreground" />
              )}
              {step.status === 'processing' && (
                <Loader2 className="w-4 h-4 text-foreground animate-spin" />
              )}
              {step.status === 'pending' && (
                <div className="w-4 h-4 rounded-full border border-border" />
              )}
            </div>
            <span className={cn(
              "text-sm transition-all duration-300",
              step.status === 'pending' && "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
