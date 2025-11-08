import { AdIdea } from "@/types/ad";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AdIdeaCardProps {
  idea: AdIdea;
  isSelected: boolean;
  onSelect: () => void;
}

export const AdIdeaCard = ({ idea, isSelected, onSelect }: AdIdeaCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer rounded-lg border transition-all duration-200 overflow-hidden",
        "hover:border-foreground/40",
        isSelected 
          ? "border-foreground ring-2 ring-foreground/10" 
          : "border-border"
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-background" />
        </div>
      )}
      
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img 
          src={`data:image/png;base64,${idea.image}`} 
          alt={idea.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground">{idea.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {idea.description}
        </p>
      </div>
    </div>
  );
};
