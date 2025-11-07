import { useMemo } from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Button, Tabs } from "@/components/ui/components";
import MeterGroupsView from "./MeterGroupsTab";
import MeterReadingsView from "./MeterReadingsTab";
import { useMeterManagement } from "../hooks/useMeterManagement";

const MeterPage = () => {
  const {
    meterGroups,
    availableAssets,
    activeUser,
    createGroup,
    updateGroup,
    deleteGroup,
    cloneGroup,
    addMeterToGroup,
    updateMeter,
    removeMeter,
    assignAssetsToGroup,
    removeAssetFromGroup,
    saveReadings,
    deleteReading,
    getReadingsByAssetId,
    getReadingSummaryByMeterId,
    reset,
  } = useMeterManagement();

  const tabs = useMemo(
    () => [
      {
        label: "Meter groups",
        value: "groups",
        content: (
          <MeterGroupsView
            groups={meterGroups}
            availableAssets={availableAssets}
            onCreateGroup={createGroup}
            onEditGroup={(groupId, name, description) => updateGroup(groupId, { name, description })}
            onDeleteGroup={deleteGroup}
            onCloneGroup={cloneGroup}
            onAddMeter={(groupId, meter) => addMeterToGroup(groupId, meter)}
            onEditMeter={(groupId, meterId, meter) => updateMeter(groupId, meterId, meter)}
            onDeleteMeter={(groupId, meterId) => removeMeter(groupId, meterId)}
            onAssignAssets={(groupId, assetIds) => assignAssetsToGroup(groupId, assetIds)}
          />
        ),
      },
      {
        label: "Meter readings",
        value: "readings",
        content: (
          <MeterReadingsView
            groups={meterGroups}
            activeUser={activeUser}
            onSaveReadings={saveReadings}
            onDeleteReading={deleteReading}
            getReadingsByAssetId={getReadingsByAssetId}
            getReadingSummaryByMeterId={getReadingSummaryByMeterId}
          />
        ),
      },
    ],
    [
      meterGroups,
      availableAssets,
      activeUser,
      createGroup,
      updateGroup,
      deleteGroup,
      cloneGroup,
      addMeterToGroup,
      updateMeter,
      removeMeter,
      assignAssetsToGroup,
      removeAssetFromGroup,
      saveReadings,
      deleteReading,
      getReadingsByAssetId,
      getReadingSummaryByMeterId,
    ]
  );

  return (
    <AppLayout
      breadcrumbs={[{ label: "Asset Maintenance" }, { label: "Meter Reading" }]}
    >
      <div className="flex h-full flex-col gap-6">
        <Tabs tabs={tabs} defaultValue="groups">
          <Button variant="secondary" onClick={reset}>
            Reset demo data
          </Button>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MeterPage;
