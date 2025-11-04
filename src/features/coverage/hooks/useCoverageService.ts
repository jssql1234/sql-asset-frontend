import { useDataQuery } from "@/hooks/useDataQuery";
import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";
import type {
  CoverageInsurance,
  CoverageInsurancePayload,
  CoverageWarranty,
  CoverageWarrantyPayload,
  CoverageClaim,
  CoverageClaimPayload,
  InsuranceSummaryMetrics,
  WarrantySummaryMetrics,
  ClaimSummaryMetrics,
} from "../types";
import * as coverageService from "../services/coverageService";

// Query keys for React Query cache management
export const COVERAGE_QUERY_KEYS = {
  insurances: ["coverage", "insurances"] as const,
  warranties: ["coverage", "warranties"] as const,
  claims: ["coverage", "claims"] as const,
  insuranceSummary: ["coverage", "insurance-summary"] as const,
  warrantySummary: ["coverage", "warranty-summary"] as const,
  claimSummary: ["coverage", "claim-summary"] as const,
} as const;

// Shared utility to invalidate all coverage-related queries
const invalidateCoverageQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: COVERAGE_QUERY_KEYS.insurances }),
    queryClient.invalidateQueries({ queryKey: COVERAGE_QUERY_KEYS.warranties }),
    queryClient.invalidateQueries({ queryKey: COVERAGE_QUERY_KEYS.claims }),
    queryClient.invalidateQueries({ queryKey: COVERAGE_QUERY_KEYS.insuranceSummary }),
    queryClient.invalidateQueries({ queryKey: COVERAGE_QUERY_KEYS.warrantySummary }),
    queryClient.invalidateQueries({ queryKey: COVERAGE_QUERY_KEYS.claimSummary }),
  ]);
};

// Insurance hooks
export function useGetInsurances() {
  return useDataQuery<CoverageInsurance[]>({
    key: COVERAGE_QUERY_KEYS.insurances,
    queryFn: coverageService.fetchInsurances,
    title: "Failed to load insurance policies",
    description: "Please try again later",
  });
}

export function useGetInsuranceSummary() {
  return useDataQuery<InsuranceSummaryMetrics>({
    key: COVERAGE_QUERY_KEYS.insuranceSummary,
    queryFn: coverageService.fetchInsuranceSummary,
    title: "Failed to load insurance summary",
    description: "Please try again later",
  });
}

export function useCreateInsurance(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<CoverageInsurance, Error, CoverageInsurancePayload>({
    mutationFn: coverageService.createInsurance,
    onSuccess: async (data) => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Insurance Policy Created",
        description: `Policy ${data.policyNumber} has been created successfully`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to create insurance policy",
        description: error.message || "Please try again",
      });
    },
  });
}

export function useUpdateInsurance(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<CoverageInsurance, Error, { id: string; data: CoverageInsurancePayload }>({
    mutationFn: ({ id, data }) => coverageService.updateInsurance(id, data),
    onSuccess: async (data) => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Insurance Policy Updated",
        description: `Policy ${data.policyNumber} has been updated successfully`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to update insurance policy",
        description: error.message || "Please try again",
      });
    },
  });
}

export function useDeleteInsurance(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<unknown, Error, string>({
    mutationFn: coverageService.deleteInsurance,
    onSuccess: async () => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Insurance Policy Deleted",
        description: "The policy has been deleted successfully",
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to delete insurance policy",
        description: error.message || "Please try again",
      });
    },
  });
}

// Warranty hooks
export function useGetWarranties() {
  return useDataQuery<CoverageWarranty[]>({
    key: COVERAGE_QUERY_KEYS.warranties,
    queryFn: coverageService.fetchWarranties,
    title: "Failed to load warranties",
    description: "Please try again later",
  });
}

export function useGetWarrantySummary() {
  return useDataQuery<WarrantySummaryMetrics>({
    key: COVERAGE_QUERY_KEYS.warrantySummary,
    queryFn: coverageService.fetchWarrantySummary,
    title: "Failed to load warranty summary",
    description: "Please try again later",
  });
}

export function useCreateWarranty(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<CoverageWarranty, Error, CoverageWarrantyPayload>({
    mutationFn: coverageService.createWarranty,
    onSuccess: async (data) => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Warranty Created",
        description: `Warranty ${data.warrantyNumber} has been created successfully`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to create warranty",
        description: error.message || "Please try again",
      });
    },
  });
}

export function useUpdateWarranty(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<CoverageWarranty, Error, { id: string; data: CoverageWarrantyPayload }>({
    mutationFn: ({ id, data }) => coverageService.updateWarranty(id, data),
    onSuccess: async (data) => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Warranty Updated",
        description: `Warranty ${data.warrantyNumber} has been updated successfully`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to update warranty",
        description: error.message || "Please try again",
      });
    },
  });
}

export function useDeleteWarranty(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<unknown, Error, string>({
    mutationFn: coverageService.deleteWarranty,
    onSuccess: async () => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Warranty Deleted",
        description: "The warranty has been deleted successfully",
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to delete warranty",
        description: error.message || "Please try again",
      });
    },
  });
}

// Claim hooks
export function useGetClaims() {
  return useDataQuery<CoverageClaim[]>({
    key: COVERAGE_QUERY_KEYS.claims,
    queryFn: coverageService.fetchClaims,
    title: "Failed to load claims",
    description: "Please try again later",
  });
}

export function useGetClaimSummary() {
  return useDataQuery<ClaimSummaryMetrics>({
    key: COVERAGE_QUERY_KEYS.claimSummary,
    queryFn: coverageService.fetchClaimSummary,
    title: "Failed to load claim summary",
    description: "Please try again later",
  });
}

export function useCreateClaim(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<CoverageClaim, Error, CoverageClaimPayload>({
    mutationFn: coverageService.createClaim,
    onSuccess: async (data) => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Claim Created",
        description: `Claim ${data.claimNumber} has been filed successfully`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to create claim",
        description: error.message || "Please try again",
      });
    },
  });
}

export function useUpdateClaim(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<CoverageClaim, Error, { id: string; data: CoverageClaimPayload }>({
    mutationFn: ({ id, data }) => coverageService.updateClaim(id, data),
    onSuccess: async (data) => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Claim Updated",
        description: `Claim ${data.claimNumber} has been updated successfully`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to update claim",
        description: error.message || "Please try again",
      });
    },
  });
}

export function useDeleteClaim(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<unknown, Error, string>({
    mutationFn: coverageService.deleteClaim,
    onSuccess: async () => {
      await invalidateCoverageQueries(queryClient);

      addToast({
        variant: "success",
        title: "Claim Deleted",
        description: "The claim has been deleted successfully",
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to delete claim",
        description: error.message || "Please try again",
      });
    },
  });
}
