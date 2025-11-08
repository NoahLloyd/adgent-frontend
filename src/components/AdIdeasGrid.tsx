import { AdIdea } from "@/types/ad";
import { AdIdeaCard } from "./AdIdeaCard";

interface AdIdeasGridProps {
  ideas: AdIdea[];
  selectedIndex: number | null;
  onSelectIdea: (index: number) => void;
}

export const AdIdeasGrid = ({ ideas, selectedIndex, onSelectIdea }: AdIdeasGridProps) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ideas.map((idea, index) => (
          <AdIdeaCard
            key={index}
            idea={idea}
            isSelected={selectedIndex === index}
            onSelect={() => onSelectIdea(index)}
          />
        ))}
      </div>
    </div>
  );
};
