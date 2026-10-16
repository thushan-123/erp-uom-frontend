import type { CompanyLookup } from "@/lib/types/item";
import type { UserCompany } from "@/lib/types/navigation";

export const MOCK_COMPANIES: CompanyLookup[] = [
  { id: "101", code: "101", name: "Alpha" },
  { id: "102", code: "102", name: "Beta" },
  { id: "103", code: "103", name: "Gamma" },
];

export const MOCK_USER_COMPANIES: UserCompany[] = [
  { id: "101", code: "101", name: "101 - Alpha", currency: "LKR", is_default: true },
  { id: "102", code: "102", name: "102 - Beta", currency: "USD", is_default: false },
  { id: "103", code: "103", name: "103 - Gamma", currency: "EUR", is_default: false },
];
