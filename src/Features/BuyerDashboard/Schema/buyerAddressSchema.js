import { z } from 'zod';
import { ADDRESS_COUNTRIES, normalizeAddressCountryCode } from '../../../utils/addressCountries';

const COUNTRY_CODES = new Set(ADDRESS_COUNTRIES.map(country => country.code));
const trimmedText = (message, maxLength) => z
  .string()
  .trim()
  .min(1, message)
  .max(maxLength, `Use ${maxLength} characters or fewer`);

export const EMPTY_BUYER_ADDRESS = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'NG',
  password: '',
  isDefault: false,
};

export const buyerAddressSchema = z.object({
  label: trimmedText('Enter an address label', 60),
  line1: trimmedText('Enter a street address', 180),
  line2: z.string().trim().max(180, 'Use 180 characters or fewer'),
  city: trimmedText('Enter a city', 100),
  state: z.string().trim().max(100, 'Use 100 characters or fewer'),
  postalCode: z.string().trim().max(24, 'Use 24 characters or fewer'),
  country: z.string().transform(normalizeAddressCountryCode).refine(code => COUNTRY_CODES.has(code), 'Choose a valid country'),
  password: z.string().min(1, 'Enter your account password'),
  isDefault: z.boolean(),
});
