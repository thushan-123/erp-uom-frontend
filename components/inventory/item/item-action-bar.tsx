"use client";

import React, { useState } from "react";
import { Plus, Edit, Save, X, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePermission } from "@/components/providers/navigation-provider";

interface ItemActionBarProps {
  mode: "view" | "edit" | "new";
  itemCode: string;
  isDirty: boolean;
  onNew: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ItemActionBar({
  mode,
  itemCode,
  isDirty,
  onNew,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onClose,
}: ItemActionBarProps) {
  const canCreate = usePermission("item-details", "create");
  const canEdit = usePermission("item-details", "edit");
  const canDelete = usePermission("item-details", "delete");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const isView = mode === "view";
  const isEditingOrNew = mode === "edit" || mode === "new";

  const handleCloseClick = () => {
    if (isDirty) {
      setCloseConfirmOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-1.5 sm:gap-2 border-t bg-card px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs shrink-0 sticky bottom-0 z-20">
        {/* 1. New Button */}
        {canCreate ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isEditingOrNew}
            onClick={onNew}
            className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 flex-1 sm:flex-initial justify-center"
          >
            <Plus className="size-3.5" />
            <span>New</span>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 opacity-50 flex-1 sm:flex-initial justify-center"
                >
                  <Plus className="size-3.5" />
                  <span>New</span>
                </Button>
              }
            />
            <TooltipContent>
              You don&apos;t have permission to create items
            </TooltipContent>
          </Tooltip>
        )}

        {/* 2. Edit Button */}
        {canEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isView}
            onClick={onEdit}
            className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 flex-1 sm:flex-initial justify-center"
          >
            <Edit className="size-3.5" />
            <span>Edit</span>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 opacity-50 flex-1 sm:flex-initial justify-center"
                >
                  <Edit className="size-3.5" />
                  <span>Edit</span>
                </Button>
              }
            />
            <TooltipContent>
              You don&apos;t have permission to edit items
            </TooltipContent>
          </Tooltip>
        )}

        {/* 3. Save Button */}
        <Button
          type="button"
          size="sm"
          disabled={isView}
          onClick={onSave}
          className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 flex-1 sm:flex-initial justify-center"
        >
          <Save className="size-3.5" />
          <span>Save</span>
        </Button>

        {/* 4. Cancel Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isView}
          onClick={onCancel}
          className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 flex-1 sm:flex-initial justify-center"
        >
          <X className="size-3.5" />
          <span>Cancel</span>
        </Button>

        {/* 5. Delete Button */}
        {canDelete ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isView}
            onClick={() => setDeleteConfirmOpen(true)}
            className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30 flex-1 sm:flex-initial justify-center"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 text-destructive opacity-50 border-destructive/30 flex-1 sm:flex-initial justify-center"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </Button>
              }
            />
            <TooltipContent>
              You don&apos;t have permission to delete items
            </TooltipContent>
          </Tooltip>
        )}

        {/* 6. Close Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isEditingOrNew}
          onClick={handleCloseClick}
          className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 flex-1 sm:flex-initial justify-center"
        >
          <LogOut className="size-3.5" />
          <span>Close</span>
        </Button>
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
      >
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive">
              Delete Item {itemCode}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This action cannot be undone. Are you sure you want to permanently delete
              this item from the master catalog and inventory records?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteConfirmOpen(false);
                onDelete();
              }}
              className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Unsaved Changes AlertDialog */}
      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              You have unsaved changes in this item record. Are you sure you want
              to discard these changes and return to the list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Stay Here</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCloseConfirmOpen(false);
                onClose();
              }}
              className="text-xs"
            >
              Discard and Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
