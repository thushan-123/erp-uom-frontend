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

interface CategoryActionBarProps {
  mode: "view" | "edit" | "new";
  categoryCode: string;
  isDirty: boolean;
  onNew: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onClose: () => void;
  isSaving?: boolean;
}

export function CategoryActionBar({
  mode,
  categoryCode,
  isDirty,
  onNew,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onClose,
  isSaving = false,
}: CategoryActionBarProps) {
  const canCreate = usePermission("item_categories", "create");
  const canEdit = usePermission("item_categories", "edit");
  const canDelete = usePermission("item_categories", "delete");

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

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
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
            <TooltipTrigger>
              <span className="inline-block flex-1 sm:flex-initial">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 w-full justify-center opacity-50 cursor-not-allowed"
                >
                  <Plus className="size-3.5" />
                  <span>New</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>You don&apos;t have permission</p>
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
            <TooltipTrigger>
              <span className="inline-block flex-1 sm:flex-initial">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 w-full justify-center opacity-50 cursor-not-allowed"
                >
                  <Edit className="size-3.5" />
                  <span>Edit</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>You don&apos;t have permission</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 3. Save Button */}
        <Button
          type="button"
          size="sm"
          disabled={!isEditingOrNew || isSaving}
          onClick={onSave}
          className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 flex-1 sm:flex-initial justify-center"
        >
          <Save className="size-3.5" />
          <span>{isSaving ? "Saving..." : "Save"}</span>
        </Button>

        {/* 4. Cancel Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!isEditingOrNew}
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
            onClick={handleDeleteClick}
            className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 flex-1 sm:flex-initial justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-block flex-1 sm:flex-initial">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 w-full justify-center opacity-50 cursor-not-allowed text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>You don&apos;t have permission</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 6. Close Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCloseClick}
          className="h-8 gap-1 text-xs px-2.5 sm:px-3 min-w-0 sm:min-w-16 flex-1 sm:flex-initial justify-center"
        >
          <LogOut className="size-3.5" />
          <span>Close</span>
        </Button>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you leave this record. Are you sure you want to close?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCloseConfirmOpen(false);
                onClose();
              }}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {categoryCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete category &quot;{categoryCode}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setDeleteConfirmOpen(false);
                onDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
