import { create } from "zustand";

interface ItemUiState {
  selectedItemCode: string | null;
  setSelectedItemCode: (code: string | null) => void;
  activeCompanyContext: string;
  setActiveCompanyContext: (companyId: string) => void;
  activePricingCompany: string;
  setActivePricingCompany: (companyId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchDialogOpen: boolean;
  setSearchDialogOpen: (open: boolean) => void;
}

export const useItemUiStore = create<ItemUiState>((set) => ({
  selectedItemCode: null,
  setSelectedItemCode: (code) => set({ selectedItemCode: code }),
  activeCompanyContext: "101",
  setActiveCompanyContext: (companyId) => set({ activeCompanyContext: companyId }),
  activePricingCompany: "101",
  setActivePricingCompany: (companyId) => set({ activePricingCompany: companyId }),
  activeTab: "company",
  setActiveTab: (tab) => set({ activeTab: tab }),
  searchDialogOpen: false,
  setSearchDialogOpen: (open) => set({ searchDialogOpen: open }),
}));
