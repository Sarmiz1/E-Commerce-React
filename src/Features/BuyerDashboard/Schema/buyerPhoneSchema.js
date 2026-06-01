import { z } from 'zod';
import {
  isValidInternationalPhone,
  normalizeLocalPhoneNumber,
  sanitizeCountryCode,
} from '../../../utils/phoneNumber';

export const buyerPhoneNumberSchema = z
  .object({
    countryCode: z
      .string()
      .transform(sanitizeCountryCode)
      .refine(value => /^[1-9][0-9]{0,2}$/.test(value), 'Choose a valid country calling code'),
    phoneNumber: z
      .string()
      .transform(normalizeLocalPhoneNumber)
      .refine(value => /^[1-9][0-9]{3,13}$/.test(value), 'Enter a valid local phone number'),
    password: z.string().min(1, 'Enter your account password'),
    isDefault: z.boolean(),
  })
  .refine(
    values => isValidInternationalPhone(values.countryCode, values.phoneNumber),
    {
      path: ['phoneNumber'],
      message: 'Enter a valid international phone number',
    },
  );

export const securedPhoneActionSchema = z.object({
  password: z.string().min(1, 'Enter your account password'),
});

export const phoneConfirmationSchema = z.object({
  confirmationCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Enter the six-digit confirmation code'),
});
