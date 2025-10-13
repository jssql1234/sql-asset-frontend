import { useParams, useNavigate } from "react-router-dom";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
import { Button } from "@/components/ui/components";
import MeterTable from "../components/MeterTable";
import { useMeterManagement } from "../hooks/useMeterManagement";
import { ArrowLeft } from "@/assets/icons";
import { AssetChip } from "@/components/AssetChip";

const MeterGroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const {
    meterGroups,
  } = useMeterManagement();

  const group = meterGroups.find(g => g.id === groupId);

  if (!group) {
    return (
      <SidebarHeader
        breadcrumbs={[
          { label: "Asset Maintenance" },
          { label: "Meter Reading" },
          { label: "Group Not Found" }
        ]}
      >
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold text-onSurface">Group not found</h2>
          <p className="text-onSurfaceVariant">The requested meter group could not be found.</p>
          <Button onClick={() => navigate("/meter-reading")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meter Groups
          </Button>
        </div>
      </SidebarHeader>
    );
  }

  const handleEditMeter = (meterId: string) => {
    // TODO: Implement meter editing modal
    console.log("Edit meter:", meterId);
  };

  const handleRemoveMeter = (meterId: string) => {
    // TODO: Implement meter removal with confirmation
    console.log("Remove meter:", meterId);
  };

  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Meter Reading" },
        { label: group.name }
      ]}
    >
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/meter-reading")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-onSurface">{group.name}</h1>
            {group.description && (
              <p className="mt-2 text-onSurfaceVariant">{group.description}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-onSurface">Assigned Assets</h2>
              <Button variant="primary" size="sm">
                Assign Assets
              </Button>
            </div>
            {group.assignedAssets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {group.assignedAssets.map((asset) => (
                  <AssetChip key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <p className="text-onSurfaceVariant">No assets assigned to this group.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-onSurface">Meters</h2>
              <Button variant="primary" size="sm">
                Add Meter
              </Button>
            </div>

            <MeterTable
              meters={group.meters}
              onEdit={handleEditMeter}
              onRemove={handleRemoveMeter}
            />
          </div>
        </div>
      </div>
    </SidebarHeader>
  );
};

export default MeterGroupDetailPage;