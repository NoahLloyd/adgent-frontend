import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { listStates, saveState, loadState, deleteState, AppState, SavedStateMeta } from "@/hooks/useSaveStates";
import { MoreHorizontal, Save, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SaveStatesMenuProps {
  getCurrentState: () => AppState;
  onLoadState: (state: AppState) => void;
}

export const SaveStatesMenu = ({ getCurrentState, onLoadState }: SaveStatesMenuProps) => {
  const [states, setStates] = useState<SavedStateMeta[]>([]);

  const refresh = () => setStates(listStates());

  useEffect(() => {
    refresh();
  }, []);

  const handleSave = () => {
    const name = window.prompt("Name this save:");
    if (!name) return;
    const id = saveState(name, getCurrentState());
    refresh();
    toast.success(`Saved state "${name}"`);
    return id;
  };

  const handleLoad = (id: string) => {
    const data = loadState(id);
    if (data) {
      onLoadState(data);
      toast.success("Loaded saved state");
    } else {
      toast.error("Save not found");
    }
  };

  const handleDelete = (id: string) => {
    deleteState(id);
    refresh();
    toast.message("Deleted save");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MoreHorizontal className="h-4 w-4" />
          Saves
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          Save States
          <Button variant="ghost" size="sm" className="h-7 px-2 gap-1" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {states.length === 0 ? (
          <DropdownMenuItem disabled>No saves yet</DropdownMenuItem>
        ) : (
          states.map((s) => (
            <div key={s.id} className="px-2 py-1.5 flex items-center justify-between text-sm">
              <div className="min-w-0">
                <div className="truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {new Date(s.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleLoad(s.id)} title="Load">
                  <Upload className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleDelete(s.id)} title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


