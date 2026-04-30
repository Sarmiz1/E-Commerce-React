import { z } from 'zod';

export const adminSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters long"),
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be under 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  admin_role: z.enum([
    "super_admin",
    "support_lead",
    "finance_manager",
    "content_moderator"
  ], {
    errorMap: () => ({ message: "Please select a valid admin role" })
  }),
  password: z.string().min(12, "Admin passwords must be at least 12 characters long for enhanced security"),
  confirm_password: z.string(),
  agree_to_terms: z.boolean().refine((val) => val === true, "You must agree to the internal security protocols"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
