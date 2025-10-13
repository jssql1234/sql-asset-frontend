import { useState } from "react";
import MeterTable, { type MeterWithConditions } from "../features/meter/components/MeterTable";
import EditMeterModal from "../features/meter/components/EditMeterModal";

// Example usage component showing how to integrate MeterTable and EditMeterModal
const MeterManagement = () => {
  const [meters, setMeters] = useState<MeterWithConditions[]>([
    {
      id: "meter-1",
      uom: "mL",
      conditions: [
        {
          id: "cond-1",
          conditionTarget: "Absolute Value",
          operator: "=",
          value: 2,
          triggerAction: "No Action",
          triggerMode: "Once",
        },
        {
          id: "cond-2",
          conditionTarget: "Absolute Value",
          operator: "=",
          value: 3,
          triggerAction: "No Action",
          triggerMode: "Once",
        },
        {
          id: "cond-3",
          conditionTarget: "Absolute Value",
          operator: "=",
          value: 5,
          triggerAction: "No Action",
          triggerMode: "Once",
        },
        {
          id: "cond-4",
          conditionTarget: "Absolute Value",
          operator: "<",
          value: 500,
          triggerAction: "Notification",
          triggerMode: "Every Time",
        },
        {
          id: "cond-5",
          conditionTarget: "Changed Value",
          operator: "=",
          value: 1001,
          triggerAction: "Create Work Order + Notification",
          triggerMode: "Once",
        },
        {
          id: "cond-6",
          conditionTarget: "Absolute Value",
          operator: "=",
          value: 100000000000000000,
          triggerAction: "Create Work Order + Notification",
          triggerMode: "Once",
        },
      ],
    },
    {
      id: "meter-2",
      uom: "kWh",
      conditions: [],
    },
    {
      id: "meter-3",
      uom: "Liters",
      conditions: [],
    },
  ]);

  const [editingMeter, setEditingMeter] = useState<MeterWithConditions | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (meterId: string) => {
    const meter = meters.find((m) => m.id === meterId);
    if (meter) {
      setEditingMeter(meter);
      setIsModalOpen(true);
    }
  };

  const handleRemove = (meterId: string) => {
    if (window.confirm("Are you sure you want to remove this meter?")) {
      setMeters((prev) => prev.filter((m) => m.id !== meterId));
    }
  };

  const handleSaveMeter = (updatedMeter: MeterWithConditions) => {
    setMeters((prev) =>
      prev.map((meter) => (meter.id === updatedMeter.id ? updatedMeter : meter))
    );
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-onSurface">
          Meter Management
        </h1>
        <p className="text-sm text-onSurfaceVariant">
          Manage meters and their conditions for asset monitoring
        </p>
      </div>

      <MeterTable
        meters={meters}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />

      <EditMeterModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        meter={editingMeter}
        onSave={handleSaveMeter}
      />
    </div>
  );
};

export default MeterManagement;
