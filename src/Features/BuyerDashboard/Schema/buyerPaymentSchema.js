import { z } from 'zod';

export const EMPTY_BUYER_PAYMENT_METHOD = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  password: '',
  isDefault: false,
};

export const cleanCardNumber = value => String(value || '').replace(/\D/g, '').slice(0, 19);
export const formatCardNumber = value => cleanCardNumber(value).replace(/(.{4})/g, '$1 ').trim();

export const inferCardBrand = value => {
  const cardNumber = cleanCardNumber(value);
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return 'Mastercard';
  if (/^(506|507|650)/.test(cardNumber)) return 'Verve';
  return 'Card';
};

export const passesLuhnCheck = value => {
  const digits = cleanCardNumber(value);
  if (digits.length < 13) return false;

  return digits
    .split('')
    .reverse()
    .reduce((sum, digit, index) => {
      const valueAtIndex = Number(digit) * (index % 2 ? 2 : 1);
      return sum + (valueAtIndex > 9 ? valueAtIndex - 9 : valueAtIndex);
    }, 0) % 10 === 0;
};

export const buyerPaymentMethodSchema = z.object({
  cardholderName: z.string().trim().min(2, 'Enter the cardholder name').max(120, 'Use 120 characters or fewer'),
  cardNumber: z.string().refine(passesLuhnCheck, 'Enter a valid card number'),
  expiry: z.string().trim().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Use MM/YY for the expiry date'),
  cvv: z.string().trim().regex(/^[0-9]{3,4}$/, 'Enter a valid CVV'),
  password: z.string().min(1, 'Enter your account password'),
  isDefault: z.boolean(),
});
