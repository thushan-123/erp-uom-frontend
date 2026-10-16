import { z } from "zod";

export const categoryFormSchema = z
  .object({
    category_code: z
      .string()
      .min(1, "Category Code and Category Name are required.")
      .max(30, "Category Code cannot exceed 30 characters."),
    category_name: z
      .string()
      .min(1, "Category Code and Category Name are required.")
      .max(100, "Category Name cannot exceed 100 characters."),
    category_level: z.enum(["MAIN", "SUB"]),
    parent_category_id: z.number().nullable(),
    description: z
      .string()
      .max(250, "Description cannot exceed 250 characters."),
    active: z.boolean(),
    prefix: z
      .string()
      .max(10, "Item Code Prefix cannot exceed 10 characters."),
    start_number: z
      .number()
      .min(1, "Starting Number must be at least 1."),
    next_number: z
      .number()
      .min(1, "Next Number must be at least 1."),
  })
  .superRefine((data, ctx) => {
    if (data.category_level === "SUB") {
      if (!data.parent_category_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A Sub Category must have a Main Category.",
          path: ["parent_category_id"],
        });
      }
    } else if (data.category_level === "MAIN") {
      if (data.parent_category_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A Main Category cannot have a parent.",
          path: ["parent_category_id"],
        });
      }
    }
  });

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
