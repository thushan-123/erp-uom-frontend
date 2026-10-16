import { create } from "zustand";

interface CompanySelectionState {
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
}

export const useCompanySelectionStore = create<CompanySelectionState>((set) => ({
  selectedCompanyId: "101",
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
}));
