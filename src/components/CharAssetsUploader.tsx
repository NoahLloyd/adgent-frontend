import { useRef } from "react";
import { Button } from "./ui/button";
import { uploadCharAsset } from "@/utils/api";

export type UploadedAsset = {
  filename: string;
  path: string;
  previewUrl: string;
};

interface CharAssetsUploaderProps {
  assets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
}

export const CharAssetsUploader = ({ assets, onAssetsChange }: CharAssetsUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = Array.from(files);

    for (const file of selected) {
      try {
        const res = await uploadCharAsset(file);
        const previewUrl = URL.createObjectURL(file);
        onAssetsChange([...assets, { filename: res.filename, path: res.path, previewUrl }]);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Upload failed", err);
      }
    }

    // reset input so selecting the same file again triggers change
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Optional: Upload reference images (characters, logo, etc.) to guide scene generation.
        </p>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleSelect}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Upload images
          </Button>
        </div>
      </div>
      {assets.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {assets.map((a, idx) => (
            <div key={`${a.filename}-${idx}`} className="rounded-md overflow-hidden border border-border bg-muted">
              <img src={a.previewUrl} alt={a.filename} className="w-full h-24 object-cover" />
              <div className="px-2 py-1">
                <p className="text-[11px] truncate text-muted-foreground">{a.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


