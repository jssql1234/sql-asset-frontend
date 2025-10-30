import React from "react";

interface ReadOnlyFieldProps {
  label: React.ReactNode;
  valueClassName?: string;
  children: React.ReactNode;
}

/**
 * Shared ReadOnlyField component for displaying non-editable form fields
 * Used in EditIncidentModal and potentially other forms
 */
export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, valueClassName, children }) => (
  <div className="rounded-lg border border-outlineVariant/80 bg-surfaceContainerLow px-3 py-2">
    <span className="label-small text-onSurfaceVariant">{label}</span>
    <div className={`mt-1 text-onSurface body-medium ${valueClassName ?? ""}`}>
      {children}
    </div>
  </div>
);
