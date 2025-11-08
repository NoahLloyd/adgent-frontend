import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Mic, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  prefill?: string;
  onVoiceClick?: () => void;
}

export const ChatInput = ({
  onSend,
  disabled,
  placeholder,
  prefill,
  onVoiceClick,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof prefill === "string" && prefill.length > 0) {
      setMessage(prefill);
    }
  }, [prefill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            "Enter your company website and any additional context..."
          }
          disabled={disabled}
          className="min-h-[120px] resize-none"
        />
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onVoiceClick?.()}
          >
            <Mic className="h-4 w-4 mr-2" />
            Voice
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={disabled || !message.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </form>
  );
};
