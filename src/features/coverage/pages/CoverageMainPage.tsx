import { lazy, Suspense, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Tabs } from "@/components/ui/components";
import { CoverageProvider } from "@/features/coverage/hooks/useCoverageContext";
import type { CoverageModalsState } from "@/features/coverage/types";

// Lazy load individual page components
const InsurancePage = lazy(() => import("@/features/coverage/pages/InsurancePage"));
const WarrantyPage = lazy(() => import("@/features/coverage/pages/WarrantyPage"));
const ClaimPage = lazy(() => import("@/features/coverage/pages/ClaimPage"));

const CoverageMainPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  
  const [modals, setModals] = useState<CoverageModalsState>({
    insuranceForm: false,
    insuranceEdit: null,
    insuranceDetails: null,
    warrantyForm: false,
    warrantyEdit: null,
    warrantyDetails: null,
    claimForm: false,
    claimEdit: null,
    workOrderFromClaim: false,
    claimForWorkOrder: null,
    claimDetails: null,
  });

  // Determine initial tab based on URL parameter
  const defaultTab = tabFromUrl === "claims" || tabFromUrl === "warranties" 
    ? tabFromUrl 
    : "insurances";

  // Handle tab change to update URL
  const handleTabChange = useCallback((value: string) => {
    if (value === "insurances") {
      // Remove tab param for default tab
      setSearchParams({});
    } else {
      setSearchParams({ tab: value });
    }
  }, [setSearchParams]);

  const tabs = useMemo(() => [
    {
      label: 'Insurance Policy',
      value: 'insurances',
      content: (
        <Suspense><InsurancePage /></Suspense>
      ),
    },
    {
      label: 'Warranty',
      value: 'warranties',
      content: (
        <Suspense><WarrantyPage /></Suspense>
      ),
    },
    {
      label: 'Claim Management',
      value: 'claims',
      content: (
        <Suspense><ClaimPage /></Suspense>
      ),
    },
  ], []);

  return (
    <AppLayout>
      <CoverageProvider modals={modals} setModals={setModals}>
        <div className="flex flex-col gap-2">
          <Tabs 
            tabs={tabs} 
            defaultValue={defaultTab} 
            onValueChange={handleTabChange}
            contentClassName="mt-6" 
          />
        </div>
      </CoverageProvider>
    </AppLayout>
  );
};

export default CoverageMainPage;
