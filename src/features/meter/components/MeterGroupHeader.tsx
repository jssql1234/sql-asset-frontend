import { Button } from "@/components/ui/components";
import type { MeterGroup } from "@/types/meter";

type MeterGroupHeaderProps = {
  group: MeterGroup;
  onEdit: () => void;
};

export const MeterGroupHeader = ({ group, onEdit }: MeterGroupHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-onSurface">{group.name}</h1>
        {group.description && (
          <p className="mt-2 text-onSurfaceVariant">{group.description}</p>
        )}
      </div>
      <Button variant="secondary" size="sm" onClick={onEdit}>
        Edit Group
      </Button>
    </div>
  );
};

export default MeterGroupHeader;
