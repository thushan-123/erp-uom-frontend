"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryGeneralTab } from "./category-general-tab";
import { CategoryNumberingTab } from "./category-numbering-tab";
import { CategoryAuditTab } from "./category-audit-tab";
import { CategoryActionBar } from "./category-action-bar";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/schemas/item-category";
import {
  getCategoryDetail,
  getMainCategoryOptions,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/item-categories";
import type {
  CategoryDetail,
  MainCategoryOption,
} from "@/lib/types/item-category";

interface CategoryRecordScreenProps {
  categoryId?: number;
  isNew?: boolean;
}

export function CategoryRecordScreen({
  categoryId,
  isNew = false,
}: CategoryRecordScreenProps) {
  const router = useRouter();

  const [mode, setMode] = useState<"view" | "edit" | "new">(
    isNew ? "new" : "view"
  );
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [mainOptions, setMainOptions] = useState<MainCategoryOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      category_code: "",
      category_name: "",
      category_level: "MAIN",
      parent_category_id: null,
      description: "",
      active: true,
      prefix: "",
      start_number: 100001,
      next_number: 100001,
    },
  });

  const { reset, handleSubmit, formState, setValue } = form;
  const isDirty = formState.isDirty;

  // Load Main Category options for the parent dropdown
  useEffect(() => {
    let mounted = true;
    getMainCategoryOptions()
      .then((data) => {
        if (mounted) setMainOptions(data);
      })
      .catch(() => {
        if (mounted) setMainOptions([]);
      })
      .finally(() => {
        if (mounted) setLoadingOptions(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch Category Details if viewing/editing
  const fetchCategory = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const data = await getCategoryDetail(id);
      setCategory(data);
      reset({
        category_code: data.category_code,
        category_name: data.category_name,
        category_level: data.category_level,
        parent_category_id: data.parent_category_id,
        description: data.description || "",
        active: data.active,
        prefix: data.number_series?.prefix || "",
        start_number: data.number_series?.start_number ?? 1,
        next_number: data.number_series?.next_number ?? 1,
      });
    } catch (err) {
      toast.error((err as Error).message || "Failed to load category details");
      router.push("/master-data/item-categories");
    } finally {
      setLoading(false);
    }
  }, [reset, router]);

  useEffect(() => {
    if (categoryId && !isNew) {
      const timer = setTimeout(() => {
        fetchCategory(categoryId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [categoryId, isNew, fetchCategory]);

  const handleLevelChange = (level: "MAIN" | "SUB") => {
    if (level === "MAIN") {
      setValue("parent_category_id", null, { shouldValidate: true, shouldDirty: true });
    }
    if (isNew) {
      if (level === "MAIN") {
        setValue("start_number", 100001);
        setValue("next_number", 100001);
      } else {
        setValue("start_number", 1);
        setValue("next_number", 1);
      }
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSaving(true);
      if (mode === "new") {
        const created = await createCategory({
          category_code: values.category_code,
          category_name: values.category_name,
          category_level: values.category_level,
          parent_category_id: values.category_level === "SUB" ? values.parent_category_id : null,
          description: values.description || undefined,
          active: values.active,
          number_series: {
            prefix: values.prefix || undefined,
            start_number: values.start_number,
          },
        });
        toast.success("Item Category saved successfully");
        router.push(`/master-data/item-categories/${created.category_id}`);
      } else if (mode === "edit" && category) {
        const updated = await updateCategory(category.category_id, {
          category_code: values.category_code,
          category_name: values.category_name,
          category_level: values.category_level,
          parent_category_id: values.category_level === "SUB" ? values.parent_category_id : null,
          description: values.description || undefined,
          active: values.active,
          number_series: {
            prefix: values.prefix || undefined,
            start_number: values.start_number,
            next_number: values.next_number,
          },
        });
        setCategory(updated);
        reset({
          category_code: updated.category_code,
          category_name: updated.category_name,
          category_level: updated.category_level,
          parent_category_id: updated.parent_category_id,
          description: updated.description || "",
          active: updated.active,
          prefix: updated.number_series?.prefix || "",
          start_number: updated.number_series?.start_number ?? 1,
          next_number: updated.number_series?.next_number ?? 1,
        });
        setMode("view");
        toast.success("Item Category saved successfully");
      }
    } catch (err: unknown) {
      const error = err as Error & {
        data?: {
          field?: string;
          error?: { details?: { field?: string } };
        };
      };
      const errorMsg = error.message || "Failed to save category";
      const field = error.data?.field || error.data?.error?.details?.field;
      if (
        field &&
        [
          "category_code",
          "category_name",
          "category_level",
          "parent_category_id",
          "prefix",
          "start_number",
          "next_number",
          "description",
        ].includes(field)
      ) {
        form.setError(field as keyof CategoryFormValues, { message: errorMsg });
      }
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    try {
      await deleteCategory(category.category_id);
      toast.success("Category deleted");
      router.push("/master-data/item-categories");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete category");
    }
  };

  const handleCancel = () => {
    if (mode === "new") {
      router.push("/master-data/item-categories");
    } else if (category) {
      reset({
        category_code: category.category_code,
        category_name: category.category_name,
        category_level: category.category_level,
        parent_category_id: category.parent_category_id,
        description: category.description || "",
        active: category.active,
        prefix: category.number_series?.prefix || "",
        start_number: category.number_series?.start_number ?? 1,
        next_number: category.number_series?.next_number ?? 1,
      });
      setMode("view");
    }
  };

  const hasAllocated =
    (category?.number_series?.next_number ?? 1) >
    (category?.number_series?.start_number ?? 1);
  const minNextNumber = category?.number_series?.next_number ?? 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-2">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading category details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/master-data/item-categories")}
            className="h-7 w-7 p-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-foreground">
              Item Category
            </h1>
            <p className="text-xs text-muted-foreground">Category master</p>
          </div>
        </div>
      </div>

      {/* Record Title Banner */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-muted/20 border-b shrink-0">
        <h2 className="text-sm font-semibold text-foreground">
          {mode === "new" ? "New Item Category" : category?.category_name}
        </h2>
        <span className="font-mono text-xs px-2 py-0.5 rounded-sm border bg-background text-muted-foreground font-semibold">
          {mode === "new" ? "<NEW>" : category?.category_code}
        </span>
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="border-b bg-card px-4 shrink-0">
            <TabsList className="h-9 p-0 bg-transparent gap-4">
              <TabsTrigger
                value="general"
                className="h-9 rounded-none border-b-2 border-transparent px-2 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="numbering"
                className="h-9 rounded-none border-b-2 border-transparent px-2 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Item Code Numbering
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="h-9 rounded-none border-b-2 border-transparent px-2 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Audit
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <TabsContent value="general" className="m-0 focus-visible:outline-none">
              <CategoryGeneralTab
                form={form}
                mode={mode}
                mainOptions={mainOptions.filter((opt) => !category || opt.category_id !== category.category_id)}
                loadingOptions={loadingOptions}
                onLevelChange={handleLevelChange}
              />
            </TabsContent>

            <TabsContent value="numbering" className="m-0 focus-visible:outline-none">
              <CategoryNumberingTab
                form={form}
                mode={mode}
                hasAllocated={hasAllocated}
                minNextNumber={minNextNumber}
              />
            </TabsContent>

            <TabsContent value="audit" className="m-0 focus-visible:outline-none">
              <CategoryAuditTab
                audit={category?.audit}
                isNew={mode === "new"}
              />
            </TabsContent>
          </div>
        </Tabs>
      </form>

        {/* Action Bar */}
        <CategoryActionBar
          mode={mode}
          categoryCode={category?.category_code || "New Category"}
          isDirty={isDirty}
          isSaving={isSaving}
          onNew={() => router.push("/master-data/item-categories/new")}
          onEdit={() => setMode("edit")}
          onSave={handleSubmit(onSubmit)}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onClose={() => router.push("/master-data/item-categories")}
        />
      </div>
    );
}
