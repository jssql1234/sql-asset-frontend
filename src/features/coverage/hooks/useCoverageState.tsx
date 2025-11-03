import { useCallback, useState, useMemo } from 'react';
import { InsurancesTab } from '@/features/coverage/components/tab/InsurancesTab';
import { WarrantiesTab } from '@/features/coverage/components/tab/WarrantiesTab';
import { ClaimsTab } from '@/features/coverage/components/tab/ClaimsTab';
import type { CoverageClaim, CoverageInsurance, CoverageWarranty, CoverageModalsState } from '@/features/coverage/types';
import { useGetInsurances, useGetInsuranceSummary, useCreateInsurance, useUpdateInsurance, useDeleteInsurance, useGetWarranties, useGetWarrantySummary,
         useCreateWarranty, useUpdateWarranty, useDeleteWarranty, useGetClaims, useGetClaimSummary, useCreateClaim, useUpdateClaim, useDeleteClaim } from './useCoverageService';

export const useCoverageState = () => {
  const { data: insurances = [] } = useGetInsurances();
  const { data: insuranceSummary = {
    activeInsurances: 0,
    totalCoverage: 0,
    remainingCoverage: 0,
    annualPremiums: 0,
    assetsCovered: 0,
    assetsNotCovered: 0,
    expiringSoon: 0,
    expired: 0,
  } } = useGetInsuranceSummary();
  const { data: warranties = [] } = useGetWarranties();
  const { data: warrantySummary = {
    activeWarranties: 0,
    assetsCovered: 0,
    assetsNotCovered: 0,
    expiringSoon: 0,
    expired: 0,
  } } = useGetWarrantySummary();
  const { data: claims = [] } = useGetClaims();
  const { data: claimSummary = {
    totalClaims: 0,
    pendingClaims: 0,
    settledClaims: 0,
    totalSettlementAmount: 0,
    rejectedClaims: 0,
  } } = useGetClaimSummary();
  const createInsurance = useCreateInsurance();
  const updateInsurance = useUpdateInsurance();
  const deleteInsurance = useDeleteInsurance();
  const createWarranty = useCreateWarranty();
  const updateWarranty = useUpdateWarranty();
  const deleteWarranty = useDeleteWarranty();
  const createClaim = useCreateClaim();
  const updateClaim = useUpdateClaim();
  const deleteClaim = useDeleteClaim();
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
  const handleCreateInsurance = useCallback((data: Omit<CoverageInsurance, 'id' | 'status' | 'totalClaimed'>) => {
    createInsurance.mutate(data, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, insuranceForm: false, insuranceEdit: null }));
      },
    });
  }, [createInsurance]);
  const handleUpdateInsurance = useCallback((id: string, data: Omit<CoverageInsurance, 'id' | 'status' | 'totalClaimed'>) => {
    updateInsurance.mutate({ id, data }, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, insuranceForm: false, insuranceEdit: null }));
      },
    });
  }, [updateInsurance]);
  const handleDeleteInsurance = useCallback((insurance: CoverageInsurance) => {
    deleteInsurance.mutate(insurance.id, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, insuranceDetails: null }));
      },
    });
  }, [deleteInsurance]);
  const handleCreateWarranty = useCallback((data: Omit<CoverageWarranty, 'id' | 'status'>) => {
    createWarranty.mutate(data, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, warrantyForm: false, warrantyEdit: null }));
      },
    });
  }, [createWarranty]);
  const handleUpdateWarranty = useCallback((id: string, data: Omit<CoverageWarranty, 'id' | 'status'>) => {
    updateWarranty.mutate({ id, data }, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, warrantyForm: false, warrantyEdit: null }));
      },
    });
  }, [updateWarranty]);
  const handleDeleteWarranty = useCallback((warranty: CoverageWarranty) => {
    deleteWarranty.mutate(warranty.id, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, warrantyDetails: null }));
      },
    });
  }, [deleteWarranty]);
  const handleCreateClaim = useCallback((data: Omit<CoverageClaim, 'id'>) => {
    createClaim.mutate(data, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, claimForm: false, claimEdit: null }));
      },
    });
  }, [createClaim]);
  const handleUpdateClaim = useCallback((id: string, data: Omit<CoverageClaim, 'id'>) => {
    updateClaim.mutate({ id, data }, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, claimForm: false, claimEdit: null }));
      },
    });
  }, [updateClaim]);
  const handleDeleteClaim = useCallback((claim: CoverageClaim) => {
    deleteClaim.mutate(claim.id, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, claimDetails: null }));
      },
    });
  }, [deleteClaim]);
  const handleViewInsurance = useCallback((insurance: CoverageInsurance) => {
    setModals(prev => ({ ...prev, insuranceDetails: insurance }));
  }, []);
  const handleEditInsurance = useCallback((insurance: CoverageInsurance) => {
    setModals(prev => ({ ...prev, insuranceForm: true, insuranceEdit: insurance }));
  }, []);
  const handleCloseInsuranceDetails = useCallback(() => {
    setModals(prev => ({ ...prev, insuranceDetails: null }));
  }, []);
  const handleViewWarranty = useCallback((warranty: CoverageWarranty) => {
    setModals(prev => ({ ...prev, warrantyDetails: warranty }));
  }, []);
  const handleEditWarranty = useCallback((warranty: CoverageWarranty) => {
    setModals(prev => ({ ...prev, warrantyForm: true, warrantyEdit: warranty }));
  }, []);
  const handleCloseWarrantyDetails = useCallback(() => {
    setModals(prev => ({ ...prev, warrantyDetails: null }));
  }, []);
  const handleViewClaim = useCallback((claim: CoverageClaim) => {
    setModals(prev => ({ ...prev, claimDetails: claim }));
  }, []);
  const handleEditClaim = useCallback((claim: CoverageClaim) => {
    setModals(prev => ({ ...prev, claimForm: true, claimEdit: claim }));
  }, []);
  const handleCloseClaimDetails = useCallback(() => {
    setModals(prev => ({ ...prev, claimDetails: null }));
  }, []);
  const handleCloseWorkOrder = useCallback(() => {
    setModals(prev => ({ ...prev, workOrderFromClaim: false, claimForWorkOrder: null }));
  }, []);
  const tabs = useMemo(() => [
    {
      label: 'Insurance Policies',
      value: 'insurances',
      content: (
        <InsurancesTab
          insurances={insurances}
          summary={insuranceSummary}
          onAddPolicy={() => {
            setModals(prev => ({ ...prev, insuranceForm: true }));
          }}
          onViewInsurance={handleViewInsurance}
          onEditInsurance={handleEditInsurance}
          onDeleteInsurance={handleDeleteInsurance}
        />
      ),
    },
    {
      label: 'Warranties',
      value: 'warranties',
      content: (
        <WarrantiesTab
          warranties={warranties}
          summary={warrantySummary}
          onAddWarranty={() => {
            setModals(prev => ({ ...prev, warrantyForm: true }));
          }}
          onViewWarranty={handleViewWarranty}
          onEditWarranty={handleEditWarranty}
          onDeleteWarranty={handleDeleteWarranty}
        />
      ),
    },
    {
      label: 'Claim Management',
      value: 'claims',
      content: (
        <ClaimsTab
          claims={claims}
          summary={claimSummary}
          onAddClaim={() => {
            setModals(prev => ({ ...prev, claimForm: true }));
          }}
          onViewClaim={handleViewClaim}
          onEditClaim={handleEditClaim}
          onDeleteClaim={handleDeleteClaim}
        />
      ),
    },
  ], [insurances, warranties, claims, insuranceSummary, warrantySummary, claimSummary, handleViewInsurance, handleEditInsurance, handleDeleteInsurance, handleViewWarranty, handleEditWarranty, handleDeleteWarranty, handleViewClaim, handleEditClaim, handleDeleteClaim]);
  return {
    insurances,
    warranties,
    claims,
    modals,
    tabs,
    setModals,
    handleCreateInsurance,
    handleUpdateInsurance,
    handleViewInsurance,
    handleEditInsurance,
    handleDeleteInsurance,
    handleCloseInsuranceDetails,
    handleCreateWarranty,
    handleUpdateWarranty,
    handleViewWarranty,
    handleEditWarranty,
    handleDeleteWarranty,
    handleCloseWarrantyDetails,
    handleCreateClaim,
    handleUpdateClaim,
    handleViewClaim,
    handleEditClaim,
    handleDeleteClaim,
    handleCloseClaimDetails,
    handleCloseWorkOrder,
  };
};
