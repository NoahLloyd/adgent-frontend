import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex w-full py-6",
      role === 'user' ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-lg",
        role === 'user' 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-foreground"
      )}>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
};
