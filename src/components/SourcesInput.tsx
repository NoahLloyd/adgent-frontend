import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Plus } from "lucide-react";

interface SourcesInputProps {
  sources: string[];
  onChange: (sources: string[]) => void;
  className?: string;
}

export const SourcesInput = ({ sources, onChange, className }: SourcesInputProps) => {
  const [newSource, setNewSource] = useState<string>("");
  const [error, setError] = useState<string>("");

  const normalizedExisting = useMemo(
    () => new Set(sources.map((s) => normalizeUrl(s))),
    [sources]
  );

  function normalizeUrl(value: string): string {
    try {
      const url = new URL(value.trim());
      // Force lower-case host and remove trailing slash for stable comparisons
      url.host = url.host.toLowerCase();
      const str = url.toString();
      return str.endsWith("/") ? str.slice(0, -1) : str;
    } catch {
      return value.trim();
    }
  }

  function validateUrl(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter a URL";
    try {
      const url = new URL(trimmed);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "URL must start with http:// or https://";
      }
      return null;
    } catch {
      return "Enter a valid URL";
    }
  }

  function addSource() {
    const validationError = validateUrl(newSource);
    if (validationError) {
      setError(validationError);
      return;
    }
    const normalized = normalizeUrl(newSource);
    if (normalizedExisting.has(normalized)) {
      setError("This source is already added");
      return;
    }
    onChange([...sources, normalized]);
    setNewSource("");
    setError("");
  }

  function removeSource(idx: number) {
    const updated = [...sources];
    updated.splice(idx, 1);
    onChange(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSource();
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Sources (optional)</label>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Add reference URLs like docs, posts, or product pages to inform generation.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Input
          value={newSource}
          onChange={(e) => {
            setNewSource(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com/brand-docs"
          aria-invalid={!!error}
        />
        <Button type="button" variant="secondary" onClick={addSource}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {sources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {sources.map((src, idx) => (
            <Badge key={src} variant="secondary" className="pl-3 pr-1 py-1">
              <span className="mr-2 max-w-[360px] truncate">{src}</span>
              <button
                type="button"
                aria-label={`Remove source ${src}`}
                className="inline-flex items-center justify-center rounded hover:bg-muted/70"
                onClick={() => removeSource(idx)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};


