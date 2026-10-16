"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ItemHeaderForm } from "./item-header-form";
import { CompanyDataTab } from "./tabs/company-data-tab";
import { InventoryTab } from "./tabs/inventory-tab";
import { PurchasingTab } from "./tabs/purchasing-tab";
import { SalesPricingTab } from "./tabs/sales-pricing-tab";
import { UomTab } from "./tabs/uom-tab";
import { AllocationTab } from "./tabs/allocation-tab";
import { ItemActionBar } from "./item-action-bar";
import {
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemLookups,
} from "@/lib/api/items";
import { createDefaultCompanySettings } from "@/lib/utils/item-defaults";
import { itemHeaderSchema } from "@/lib/schemas/item";
import type { Item, ItemLookups } from "@/lib/types/item";

interface ItemRecordScreenProps {
  initialCode?: string;
  isNew?: boolean;
}

export function ItemRecordScreen({
  initialCode,
  isNew = false,
}: ItemRecordScreenProps) {
  const router = useRouter();

  const [mode, setMode] = useState<"view" | "edit" | "new">(
    isNew ? "new" : "view"
  );
  const [activeTab, setActiveTab] = useState("company");
  const [companyContext, setCompanyContext] = useState("101");
  const [pricingCompany, setPricingCompany] = useState("101");
  const [loading, setLoading] = useState(!isNew);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [lookups, setLookups] = useState<ItemLookups>({
    main_categories: [],
    brands: [],
    uom_groups: [],
    base_uoms: [],
    alternate_uoms: [],
    tax_codes: [],
    price_lists: [],
    currencies: [],
    suppliers: [],
    gl_accounts: [],
    locations: [],
    companies: [],
  });

  const defaultNewItem: Item = {
    code: "<NEW>",
    name: "",
    description: "",
    main_category: "",
    main_category_name: "",
    sub_category: "",
    brand: "-- None --",
    uom_group: "Weight",
    base_uom: "KG",
    hs_code: "",
    weight: null,
    barcode: "",
    supplier_code: "",
    is_active: true,
    picture_url: null,
    companies: [
      { company_id: "101", company_name: "Alpha", is_allocated: true, is_active: true },
      { company_id: "102", company_name: "Beta", is_allocated: false, is_active: false },
      { company_id: "103", company_name: "Gamma", is_allocated: false, is_active: false },
    ],
    company_settings: {
      "101": createDefaultCompanySettings("101"),
      "102": createDefaultCompanySettings("102"),
      "103": createDefaultCompanySettings("103"),
    },
    uom_conversions: [],
    supplier_pricing: [],
    inventory_locations: [
      {
        location_id: "LOC001",
        location_name: "Main Warehouse",
        default_bin: "BIN-A01",
        min_stock: 0,
        max_stock: 0,
        reorder_level: 0,
        on_hand: 0,
        committed: 0,
        ordered: 0,
        available: 0,
        status: "Active",
      },
    ],
  };

  const [item, setItem] = useState<Item>(defaultNewItem);
  const [originalItem, setOriginalItem] = useState<Item>(defaultNewItem);

  // Load lookups
  useEffect(() => {
    let active = true;
    getItemLookups()
      .then((data) => {
        if (active) setLookups(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Load item if initialCode is provided and not new
  useEffect(() => {
    if (!initialCode || isNew) return;

    let active = true;
    getItem(initialCode)
      .then((data) => {
        if (active) {
          setItem(data);
          setOriginalItem(JSON.parse(JSON.stringify(data)));
          setMode("view");
        }
      })
      .catch((err) => {
        toast.error(`Item ${initialCode} could not be loaded: ${err.message}`);
        router.push("/inventory/item-details");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialCode, isNew, router]);

  // Handle Save
  const handleSave = async () => {
    setErrors({});

    // Validate with Zod
    const validation = itemHeaderSchema.safeParse({
      name: item.name,
      description: item.description,
      main_category: item.main_category,
      sub_category: item.sub_category,
      brand: item.brand,
      uom_group: item.uom_group,
      base_uom: item.base_uom,
      hs_code: item.hs_code,
      weight: item.weight,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fill in all required fields (Item Name and Main Category).");
      return;
    }

    try {
      if (mode === "new") {
        const created = await createItem(item);
        toast.success(`Item saved successfully. Item Code: ${created.code}`);
        setIsDirty(false);
        router.push(`/inventory/item-details/${created.code}`);
      } else {
        const updated = await updateItem(item.code, item);
        toast.success(`Item saved successfully. Item Code: ${updated.code}`);
        setItem(updated);
        setOriginalItem(JSON.parse(JSON.stringify(updated)));
        setMode("view");
        setIsDirty(false);
      }
    } catch (err) {
      toast.error((err as Error).message || "Failed to save item");
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    if (mode === "new") {
      router.push("/inventory/item-details");
    } else {
      setItem(JSON.parse(JSON.stringify(originalItem)));
      setErrors({});
      setMode("view");
      setIsDirty(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!item.code || item.code === "<NEW>") return;

    try {
      await deleteItem(item.code);
      toast.success(`Item ${item.code} deleted successfully`);
      router.push("/inventory/item-details");
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete item");
    }
  };

  const currentCompanySettings =
    item.company_settings[companyContext] ||
    createDefaultCompanySettings(companyContext);

  const currentPricingSettings =
    item.company_settings[pricingCompany] ||
    createDefaultCompanySettings(pricingCompany);

  const targetCompName =
    lookups.companies.find((c) => c.id === companyContext)?.name || "Alpha";

  const isViewMode = mode === "view";

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center p-8 text-xs text-muted-foreground">
        Loading item master details...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background min-w-0">
      {/* 1. Header Bar */}
      <div className="flex h-auto min-h-12 shrink-0 items-center justify-between border-b bg-card px-3 sm:px-4 py-2 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm font-bold text-foreground truncate">
            Item Master Data
          </h1>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 sm:line-clamp-none">
            Create and maintain common item information
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isDirty) {
              if (confirm("You have unsaved changes. Discard and return to list?")) {
                router.push("/inventory/item-details");
              }
            } else {
              router.push("/inventory/item-details");
            }
          }}
          className="h-8 gap-1.5 text-xs shrink-0"
        >
          <ArrowLeft className="size-3.5" />
          <span className="hidden sm:inline">Back to List</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      {/* 2. Scrollable Body: Header Form + Tabs */}
      <div className="flex-1 overflow-auto min-w-0">
        <ItemHeaderForm
          mode={mode}
          itemCode={item.code}
          name={item.name}
          onNameChange={(val) => {
            setItem({ ...item, name: val });
            setIsDirty(true);
          }}
          description={item.description}
          onDescriptionChange={(val) => {
            setItem({ ...item, description: val });
            setIsDirty(true);
          }}
          mainCategory={item.main_category}
          onMainCategoryChange={(val) => {
            setItem({ ...item, main_category: val });
            setIsDirty(true);
          }}
          subCategory={item.sub_category}
          onSubCategoryChange={(val) => {
            setItem({ ...item, sub_category: val });
            setIsDirty(true);
          }}
          brand={item.brand}
          onBrandChange={(val) => {
            setItem({ ...item, brand: val });
            setIsDirty(true);
          }}
          uomGroup={item.uom_group}
          onUomGroupChange={(val) => {
            setItem({ ...item, uom_group: val });
            setIsDirty(true);
          }}
          baseUom={item.base_uom}
          onBaseUomChange={(val) => {
            setItem({ ...item, base_uom: val });
            setIsDirty(true);
          }}
          hsCode={item.hs_code}
          onHsCodeChange={(val) => {
            setItem({ ...item, hs_code: val });
            setIsDirty(true);
          }}
          weight={item.weight}
          onWeightChange={(val) => {
            setItem({ ...item, weight: val });
            setIsDirty(true);
          }}
          pictureUrl={item.picture_url}
          onPictureChange={(url) => {
            setItem({ ...item, picture_url: url });
            setIsDirty(true);
          }}
          companyContext={companyContext}
          onCompanyContextChange={setCompanyContext}
          lookups={lookups}
          errors={errors}
        />

        {/* 3. Six Tabs */}
        <div className="p-3 sm:p-4 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 mb-4">
              <TabsList className="inline-flex w-max min-w-full justify-start h-9">
                <TabsTrigger value="company" className="text-xs shrink-0">
                  Company Data
                </TabsTrigger>
                <TabsTrigger value="inventory" className="text-xs shrink-0">
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="purchasing" className="text-xs shrink-0">
                  Purchasing
                </TabsTrigger>
                <TabsTrigger value="salespricing" className="text-xs shrink-0">
                  Sales &amp; Pricing
                </TabsTrigger>
                <TabsTrigger value="uom" className="text-xs shrink-0">
                  UOM
                </TabsTrigger>
                <TabsTrigger value="allocation" className="text-xs shrink-0">
                  Company Allocation
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Company Data */}
            <TabsContent value="company" className="outline-none mt-0">
              <CompanyDataTab
                companyId={companyContext}
                companyName={targetCompName}
                settings={currentCompanySettings}
                onChange={(updated) => {
                  setItem({
                    ...item,
                    company_settings: {
                      ...item.company_settings,
                      [companyContext]: updated,
                    },
                  });
                  setIsDirty(true);
                }}
                disabled={isViewMode}
                lookups={lookups}
              />
            </TabsContent>

            {/* Tab 2: Inventory */}
            <TabsContent value="inventory" className="outline-none mt-0">
              <InventoryTab
                locations={item.inventory_locations}
                onChange={(locations) => {
                  setItem({ ...item, inventory_locations: locations });
                  setIsDirty(true);
                }}
                disabled={isViewMode}
                lookups={lookups}
              />
            </TabsContent>

            {/* Tab 3: Purchasing */}
            <TabsContent value="purchasing" className="outline-none mt-0">
              <PurchasingTab
                supplierPricing={item.supplier_pricing}
                onPricingChange={(pricing) => {
                  setItem({ ...item, supplier_pricing: pricing });
                  setIsDirty(true);
                }}
                defaultPurchaseUom={currentCompanySettings.purchase_uom || "KG"}
                onDefaultPurchaseUomChange={(val) => {
                  setItem({
                    ...item,
                    company_settings: {
                      ...item.company_settings,
                      [companyContext]: {
                        ...currentCompanySettings,
                        purchase_uom: val,
                      },
                    },
                  });
                  setIsDirty(true);
                }}
                defaultTaxCode={currentCompanySettings.tax_code || "VAT 8%"}
                onDefaultTaxCodeChange={(val) => {
                  setItem({
                    ...item,
                    company_settings: {
                      ...item.company_settings,
                      [companyContext]: {
                        ...currentCompanySettings,
                        tax_code: val,
                      },
                    },
                  });
                  setIsDirty(true);
                }}
                preferredSupplierId={
                  item.supplier_pricing.find((r) => r.is_preferred)?.supplier_id ||
                  item.supplier_code ||
                  ""
                }
                onPreferredSupplierChange={(supId) => {
                  const updatedPricing = item.supplier_pricing.map((r) => ({
                    ...r,
                    is_preferred: r.supplier_id === supId,
                  }));
                  setItem({
                    ...item,
                    supplier_code: supId,
                    supplier_pricing: updatedPricing,
                  });
                  setIsDirty(true);
                }}
                disabled={isViewMode}
                lookups={lookups}
              />
            </TabsContent>

            {/* Tab 4: Sales & Pricing */}
            <TabsContent value="salespricing" className="outline-none mt-0">
              <SalesPricingTab
                pricingCompanyId={pricingCompany}
                onPricingCompanyChange={setPricingCompany}
                settings={currentPricingSettings}
                onSettingsChange={(updated) => {
                  setItem({
                    ...item,
                    company_settings: {
                      ...item.company_settings,
                      [pricingCompany]: updated,
                    },
                  });
                  setIsDirty(true);
                }}
                disabled={isViewMode}
                lookups={lookups}
              />
            </TabsContent>

            {/* Tab 5: UOM */}
            <TabsContent value="uom" className="outline-none mt-0">
              <UomTab
                itemCode={item.code}
                itemName={item.name}
                baseUom={item.base_uom}
                conversions={item.uom_conversions}
                onChange={(conversions) => {
                  setItem({ ...item, uom_conversions: conversions });
                  setIsDirty(true);
                }}
                disabled={isViewMode}
              />
            </TabsContent>

            {/* Tab 6: Company Allocation */}
            <TabsContent value="allocation" className="outline-none mt-0">
              <AllocationTab
                companies={item.companies}
                onCompaniesChange={(companies) => {
                  setItem({ ...item, companies });
                  setIsDirty(true);
                }}
                allCompanies={lookups.companies}
                disabled={isViewMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 4. Action Bar */}
      <ItemActionBar
        mode={mode}
        itemCode={item.code}
        isDirty={isDirty}
        onNew={() => router.push("/inventory/item-details/new")}
        onEdit={() => setMode("edit")}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onClose={() => router.push("/inventory/item-details")}
      />
    </div>
  );
}
