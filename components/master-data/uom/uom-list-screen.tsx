"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Plus, RefreshCw, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UomRecord = Record<string, string | number | boolean | null>;

type UomResponse = {
  success: boolean;
  message?: string;
  data: UomRecord[];
};

type UomUpdateResponse = {
  success: boolean;
  message?: string;
  detail?: string;
  data?: UomRecord;
};

type UomCreateValues = {
  uom_code: string;
  uom_name: string;
  uom_category: string;
  decimal_places: string;
  description: string;
  active: boolean;
};

const EMPTY_UOM_FORM: UomCreateValues = {
  uom_code: "",
  uom_name: "",
  uom_category: "",
  decimal_places: "0",
  description: "",
  active: true,
};

export function UomListScreen() {
  const [records, setRecords] = useState<UomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createValues, setCreateValues] = useState<UomCreateValues>(EMPTY_UOM_FORM);

  const fetchRecords = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/uom", { cache: "no-store" });
      const result = (await response.json()) as UomResponse & { detail?: string };
      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.detail || result.message || "Failed to load units of measure.");
      }
      setRecords(result.data);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load units of measure."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  const toggleActive = async (record: UomRecord) => {
    const id = record.uom_id;
    if (typeof id !== "number" || updatingIds.includes(id)) return;

    setUpdatingIds((current) => [...current, id]);
    setActionError(null);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/uom/${id}`, { method: "PATCH" });
      const result = (await response.json()) as UomUpdateResponse;
      if (!response.ok || !result.success || !result.data || typeof result.data.active !== "boolean") {
        throw new Error(result.detail || result.message || "Failed to update UOM status.");
      }

      setRecords((current) =>
        current.map((item) => (item.uom_id === id ? result.data! : item))
      );
      setActionMessage(result.message || "UOM status updated.");
    } catch (updateError) {
      setActionError(
        updateError instanceof Error ? updateError.message : "Failed to update UOM status."
      );
    } finally {
      setUpdatingIds((current) => current.filter((itemId) => itemId !== id));
    }
  };

  const createUom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const response = await fetch("/api/uom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createValues,
          uom_code: createValues.uom_code.trim(),
          uom_name: createValues.uom_name.trim(),
          uom_category: createValues.uom_category.trim(),
          decimal_places: Number(createValues.decimal_places),
          description: createValues.description.trim(),
        }),
      });
      const result = (await response.json()) as UomUpdateResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.detail || result.message || "Failed to create UOM.");
      }

      setRecords((current) => [
        result.data!,
        ...current.filter((record) => record.uom_id !== result.data!.uom_id),
      ]);
      setCreateValues(EMPTY_UOM_FORM);
      setCreateOpen(false);
      setActionMessage(result.message || "UOM created successfully.");
    } catch (createError) {
      setActionError(
        createError instanceof Error ? createError.message : "Failed to create UOM."
      );
    } finally {
      setCreating(false);
    }
  };

  const columns = records.length > 0 ? Object.keys(records[0]) : [];

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-card px-4 py-3">
        <div>
          <h1 className="text-sm font-bold text-foreground sm:text-base">Units of Measure</h1>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading records…" : `${records.length} records · ${columns.length} columns`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              setActionError(null);
              setCreateOpen(true);
            }}
          >
            <Plus className="size-3.5" />
            Create UOM
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-xs"
            onClick={() => void fetchRecords(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Unit of Measure</DialogTitle>
            <DialogDescription>Enter the details for the new unit of measure.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createUom} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-medium">
                UOM Code <span className="text-destructive">*</span>
                <Input
                  required
                  maxLength={50}
                  value={createValues.uom_code}
                  onChange={(event) => setCreateValues((current) => ({ ...current, uom_code: event.target.value }))}
                  placeholder="e.g. KG"
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                UOM Name <span className="text-destructive">*</span>
                <Input
                  required
                  maxLength={100}
                  value={createValues.uom_name}
                  onChange={(event) => setCreateValues((current) => ({ ...current, uom_name: event.target.value }))}
                  placeholder="e.g. Kilogram"
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                UOM Category <span className="text-destructive">*</span>
                <Input
                  required
                  maxLength={100}
                  value={createValues.uom_category}
                  onChange={(event) => setCreateValues((current) => ({ ...current, uom_category: event.target.value }))}
                  placeholder="e.g. Weight"
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                Decimal Places <span className="text-destructive">*</span>
                <Input
                  required
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={createValues.decimal_places}
                  onChange={(event) => setCreateValues((current) => ({ ...current, decimal_places: event.target.value }))}
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium sm:col-span-2">
                Description
                <Textarea
                  maxLength={500}
                  value={createValues.description}
                  onChange={(event) => setCreateValues((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Optional description"
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                Initial Status
                <NativeSelect
                  value={String(createValues.active)}
                  onChange={(event) => setCreateValues((current) => ({ ...current, active: event.target.value === "true" }))}
                  className="w-full"
                >
                  <NativeSelectOption value="true">Active</NativeSelectOption>
                  <NativeSelectOption value="false">Inactive</NativeSelectOption>
                </NativeSelect>
              </label>
            </div>
            {actionError && (
              <Alert variant="destructive">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <RefreshCw className="size-3.5 animate-spin" />}
                {creating ? "Saving…" : "Save UOM"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {actionError && (
        <Alert variant="destructive" className="mx-4 mt-3 w-auto">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      {actionMessage && !actionError && (
        <Alert className="mx-4 mt-3 w-auto">
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      )}

      {error ? (
        <Alert variant="destructive" className="m-4 w-auto">
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void fetchRecords()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="overflow-hidden rounded-md border bg-card">
            <Table className="min-w-max">
              <TableHeader className="sticky top-0 z-10 bg-muted/95">
                <TableRow className="hover:bg-transparent">
                  {columns.map((column) => (
                    <TableHead key={column} className="px-3 text-[11px] font-semibold uppercase tracking-wide">
                      {column.replaceAll("_", " ")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(columns.length, 1)} className="h-24 text-center text-muted-foreground">
                      Loading UOM records…
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(columns.length, 1)} className="h-24 text-center text-muted-foreground">
                      No units of measure found.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record, rowIndex) => (
                    <TableRow key={String(record.uom_id ?? rowIndex)}>
                      {columns.map((column) => {
                        const value = record[column];
                        return (
                          <TableCell key={column} className="px-3 py-2 text-xs">
                            {column === "active" && typeof value === "boolean" ? (
                              <Button
                                type="button"
                                variant={value ? "default" : "secondary"}
                                size="sm"
                                className="h-7 min-w-24 gap-1.5 px-2 text-[11px]"
                                aria-label={`${value ? "Deactivate" : "Activate"} ${String(record.uom_code ?? `UOM ${record.uom_id}`)}`}
                                aria-pressed={value}
                                disabled={typeof record.uom_id !== "number" || updatingIds.includes(record.uom_id)}
                                onClick={() => void toggleActive(record)}
                              >
                                {updatingIds.includes(Number(record.uom_id)) ? (
                                  <RefreshCw className="size-3 animate-spin" />
                                ) : value ? (
                                  <Check className="size-3" />
                                ) : (
                                  <X className="size-3" />
                                )}
                                {value ? "Active" : "Inactive"}
                              </Button>
                            ) : typeof value === "boolean" ? (
                              <Badge variant={value ? "default" : "secondary"} className="gap-1">
                                {value ? <Check className="size-3" /> : <X className="size-3" />}
                                {String(value)}
                              </Badge>
                            ) : value === null || value === undefined || value === "" ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              String(value)
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  );
}
