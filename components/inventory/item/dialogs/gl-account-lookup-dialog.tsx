"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import type { GlAccountLookup } from "@/lib/types/item";

interface GlAccountLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: GlAccountLookup[];
  title?: string;
  onSelect: (accountLabel: string) => void;
}

export function GlAccountLookupDialog({
  open,
  onOpenChange,
  accounts,
  title = "Select G/L Account",
  onSelect,
}: GlAccountLookupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Search chart of accounts by code or account description.
          </DialogDescription>
        </DialogHeader>

        <Command className="border-0">
          <CommandInput
            placeholder="Type account code or name..."
            className="text-xs"
          />
          <CommandList className="max-h-60 p-1">
            <CommandEmpty className="p-4 text-center text-xs text-muted-foreground">
              No matching G/L account found.
            </CommandEmpty>
            <CommandGroup heading="G/L Accounts">
              {accounts.map((acc) => (
                <CommandItem
                  key={acc.code}
                  value={`${acc.code} ${acc.name} ${acc.label}`}
                  onSelect={() => {
                    onSelect(acc.label);
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between text-xs cursor-pointer py-1.5 px-2"
                >
                  <span className="font-medium">{acc.label}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    #{acc.code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
