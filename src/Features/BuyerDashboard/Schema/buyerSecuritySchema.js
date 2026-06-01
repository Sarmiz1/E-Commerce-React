import { z } from 'zod';

export const securedBuyerActionSchema = z.object({
  password: z.string().min(1, 'Enter your account password'),
});

export const buyerActionConfirmationSchema = z.object({
  confirmationCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Enter the six-digit confirmation code'),
});
