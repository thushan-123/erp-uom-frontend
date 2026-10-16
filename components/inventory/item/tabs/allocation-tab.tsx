"use client";

import React from "react";
import { Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ItemCompanyAllocation, CompanyLookup } from "@/lib/types/item";

interface AllocationTabProps {
  companies: ItemCompanyAllocation[];
  onCompaniesChange: (companies: ItemCompanyAllocation[]) => void;
  allCompanies: CompanyLookup[];
  disabled: boolean;
}

export function AllocationTab({
  companies,
  onCompaniesChange,
  allCompanies,
  disabled,
}: AllocationTabProps) {
  const handleAllocate = (companyId: string) => {
    if (disabled) return;
    const targetComp = allCompanies.find((c) => c.id === companyId);
    const compName = targetComp ? targetComp.name : companyId;

    const existingIndex = companies.findIndex((c) => c.company_id === companyId);
    let updated: ItemCompanyAllocation[];

    if (existingIndex >= 0) {
      updated = [...companies];
      updated[existingIndex] = {
        ...updated[existingIndex],
        is_allocated: true,
        is_active: true,
      };
    } else {
      updated = [
        ...companies,
        {
          company_id: companyId,
          company_name: compName,
          is_allocated: true,
          is_active: true,
        },
      ];
    }

    onCompaniesChange(updated);
  };

  const handleToggleActive = (companyId: string, active: boolean) => {
    if (disabled) return;
    const updated = companies.map((c) =>
      c.company_id === companyId ? { ...c, is_active: active } : c
    );
    onCompaniesChange(updated);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-2.5 px-3 sm:px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Company Allocation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Allocate the item to a company. Once allocated, the company cannot be deallocated. Active status can be changed at company level.
          </p>

          <div className="overflow-x-auto min-w-0 rounded-md border">
            <Table className="min-w-[460px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-40 text-xs font-mono">Company Code</TableHead>
                  <TableHead className="text-xs">Company Name</TableHead>
                  <TableHead className="w-32 text-center text-xs">Allocated</TableHead>
                  <TableHead className="w-24 text-center text-xs">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCompanies.map((c) => {
                  const alloc = companies.find((x) => x.company_id === c.id);
                  const isAllocated = Boolean(alloc?.is_allocated);
                  const isActive = Boolean(alloc?.is_active);

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {c.code}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-center p-2">
                        {isAllocated ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled
                            className="h-6 px-3 text-[11px] gap-1 cursor-not-allowed opacity-80"
                          >
                            <Check className="size-3 text-primary" />
                            Allocated
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                            onClick={() => handleAllocate(c.id)}
                            className="h-6 px-3 text-[11px]"
                          >
                            Allocate
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-center p-2">
                        <Checkbox
                          checked={isActive}
                          disabled={disabled || !isAllocated}
                          onCheckedChange={(checked) =>
                            handleToggleActive(c.id, Boolean(checked))
                          }
                          className="size-4"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
