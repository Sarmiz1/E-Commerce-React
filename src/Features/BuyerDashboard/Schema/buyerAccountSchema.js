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

export const buyerAccountSchema = z.object({
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
  });

export const buyerPasswordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password').max(128, 'Current password is too long'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128, 'New password is too long'),
    confirmPassword: z.string().max(128, 'Password confirmation is too long'),
  })
  .superRefine((values, context) => {
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

export const BUYER_DEACTIVATION_REASONS = [
  { id: 'taking_a_break', label: 'I am taking a break' },
  { id: 'not_using_account', label: 'I am not using my account' },
  { id: 'privacy_concerns', label: 'I have privacy concerns' },
  { id: 'shopping_experience', label: 'I am unhappy with the shopping experience' },
  { id: 'other', label: 'Other reason' },
];

export const deactivateBuyerAccountSchema = z
  .object({
    confirmation: z.literal('DEACTIVATE', {
      message: 'Type DEACTIVATE to confirm account deactivation',
    }),
    reason: z.enum(BUYER_DEACTIVATION_REASONS.map(({ id }) => id), {
      message: 'Choose a reason for deactivating your account',
    }),
    otherReason: z.string().trim().max(500, 'Reason must be under 500 characters'),
    password: z.string().min(1, 'Enter your account password'),
  })
  .superRefine((values, context) => {
    if (values.reason === 'other' && values.otherReason.length < 3) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherReason'],
        message: 'Tell us why you are deactivating your account',
      });
    }
  });

export const buyerEmailUpdateSchema = z.object({
  email: z
    .string({ message: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Enter a valid email address')
    .max(254, 'Email must be under 254 characters'),
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
    avatarUrl: values.avatarUrl,
    avatarFile: values.avatarFile,
    preferences: {
      aiSuggestions: values.aiSuggestions,
      priceDropAlerts: values.priceDropAlerts,
      orderStatusUpdates: values.orderStatusUpdates,
      promotionsDeals: values.promotionsDeals,
    },
  };
}
