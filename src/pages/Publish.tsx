import { useMemo, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopProgressBar } from "@/components/TopProgressBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type PlatformKey = "youtube" | "tiktok" | "instagram" | "facebook" | "linkedin";

const PLATFORMS: { key: PlatformKey; label: string }[] = [
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
];

const Publish = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("My Generated Ad");
  const [description, setDescription] = useState<string>("Check out our latest ad!");
  const [selected, setSelected] = useState<Record<PlatformKey, boolean>>({
    youtube: true,
    tiktok: false,
    instagram: false,
    facebook: false,
    linkedin: false,
  });

  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );

  const handleToggle = (key: PlatformKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePublish = () => {
    if (selectedCount === 0) {
      toast.error("Select at least one platform to publish");
      return;
    }
    toast.success(`Publishing to ${selectedCount} platform${selectedCount > 1 ? "s" : ""}…`);
    setTimeout(() => {
      toast.success("Published!");
      navigate("/");
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopProgressBar
          steps={["Idea", "Storyboard", "Scenes", "Video", "Publish"]}
          activeIndex={4}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Video title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Say something about your video…"
                    rows={6}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium mb-3">Publish to</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PLATFORMS.map((p) => (
                      <label
                        key={p.key}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer select-none hover:bg-accent"
                      >
                        <Checkbox
                          checked={selected[p.key]}
                          onCheckedChange={() => handleToggle(p.key)}
                        />
                        <span className="text-sm">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={handlePublish}>
                    Publish{selectedCount > 0 ? ` (${selectedCount})` : ""}
                  </Button>
                </div>
              </div>
              {/* Right: preview in the corner */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 rounded-md border border-border overflow-hidden bg-black">
                  <video src="/demo.mp4" controls className="w-full h-64 object-contain bg-black" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Publish;


