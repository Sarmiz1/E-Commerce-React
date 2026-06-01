import { z } from 'zod';

const PASSWORD_RULES = [
  [/[A-Z]/, 'New password must include an uppercase letter'],
  [/[a-z]/, 'New password must include a lowercase letter'],
  [/[0-9]/, 'New password must include a number'],
  [/[^A-Za-z0-9]/, 'New password must include a special character'],
];

const optionalAvatarFile = z
  .custom(
    (file) => file == null || (typeof File !== 'undefined' && file instanceof File),
    'Choose a valid image file',
  )
  .refine((file) => !file || file.size <= 2 * 1024 * 1024, 'Photo must be 2MB or smaller')
  .refine(
    (file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Photo must be a JPG, PNG, or WEBP image',
  )
  .optional()
  .nullable();

export const buyerAccountSchema = z
  .object({
    fullName: z
      .string({ message: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(120, 'Full name must be under 120 characters'),
    email: z
      .string({ message: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email('Enter a valid email address')
      .max(254, 'Email must be under 254 characters'),
    avatarUrl: z.string().trim().url('Avatar URL is invalid').or(z.literal('')),
    avatarFile: optionalAvatarFile,
    aiSuggestions: z.boolean(),
    priceDropAlerts: z.boolean(),
    orderStatusUpdates: z.boolean(),
    promotionsDeals: z.boolean(),
    currentPassword: z.string().max(128, 'Current password is too long'),
    newPassword: z.string().max(128, 'New password is too long'),
    confirmPassword: z.string().max(128, 'Password confirmation is too long'),
  })
  .superRefine((values, context) => {
    const changingPassword = Boolean(
      values.currentPassword || values.newPassword || values.confirmPassword,
    );

    if (!changingPassword) return;

    if (!values.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currentPassword'],
        message: 'Enter your current password',
      });
    }

    if (values.newPassword.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newPassword'],
        message: 'New password must be at least 8 characters',
      });
    }

    PASSWORD_RULES.forEach(([rule, message]) => {
      if (!rule.test(values.newPassword)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message,
        });
      }
    });

    if (values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const deleteBuyerAccountSchema = z.object({
  confirmation: z.literal('DELETE', {
    message: 'Type DELETE to confirm account deletion',
  }),
  password: z.string().min(1, 'Enter your account password'),
});

export const EMPTY_BUYER_ACCOUNT_FORM = {
  fullName: '',
  email: '',
  avatarUrl: '',
  avatarFile: null,
  aiSuggestions: true,
  priceDropAlerts: true,
  orderStatusUpdates: true,
  promotionsDeals: false,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function toBuyerAccountFormValues(settings, fallbackProfile = {}) {
  const profile = settings?.profile || fallbackProfile;
  const preferences = settings?.preferences || {};

  return {
    ...EMPTY_BUYER_ACCOUNT_FORM,
    fullName: profile.full_name || profile.name || '',
    email: profile.email || '',
    avatarUrl: profile.avatar_url || '',
    aiSuggestions: preferences.ai_suggestions ?? true,
    priceDropAlerts: preferences.price_drop_alerts ?? true,
    orderStatusUpdates: preferences.order_status_updates ?? true,
    promotionsDeals: preferences.promotions_deals ?? false,
  };
}

export function toBuyerAccountPayload(values) {
  return {
    fullName: values.fullName,
    email: values.email,
    avatarUrl: values.avatarUrl,
    avatarFile: values.avatarFile,
    preferences: {
      aiSuggestions: values.aiSuggestions,
      priceDropAlerts: values.priceDropAlerts,
      orderStatusUpdates: values.orderStatusUpdates,
      promotionsDeals: values.promotionsDeals,
    },
    password: values.newPassword
      ? {
          current: values.currentPassword,
          next: values.newPassword,
        }
      : null,
  };
}
