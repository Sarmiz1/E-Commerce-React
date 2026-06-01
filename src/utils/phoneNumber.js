const DIGITS_ONLY = /\D/g;

export const sanitizeCountryCode = value =>
  String(value ?? '').replace(DIGITS_ONLY, '').slice(0, 3);

export const sanitizeLocalPhoneNumber = value =>
  String(value ?? '').replace(DIGITS_ONLY, '').slice(0, 14);

export const normalizeLocalPhoneNumber = value =>
  sanitizeLocalPhoneNumber(value).replace(/^0+/, '');

export const formatInternationalPhone = (countryCode, phoneNumber) => {
  const normalizedCountryCode = sanitizeCountryCode(countryCode);
  const normalizedPhoneNumber = normalizeLocalPhoneNumber(phoneNumber);

  if (!normalizedCountryCode || !normalizedPhoneNumber) return '';
  return `+${normalizedCountryCode}${normalizedPhoneNumber}`;
};

export const isValidInternationalPhone = (countryCode, phoneNumber) => {
  const normalizedCountryCode = sanitizeCountryCode(countryCode);
  const normalizedPhoneNumber = normalizeLocalPhoneNumber(phoneNumber);
  const totalLength = normalizedCountryCode.length + normalizedPhoneNumber.length;

  return /^[1-9][0-9]{0,2}$/.test(normalizedCountryCode)
    && /^[1-9][0-9]{3,13}$/.test(normalizedPhoneNumber)
    && totalLength >= 7
    && totalLength <= 15;
};

export const COUNTRY_CALLING_CODES = [
  { code: '234', label: 'Nigeria (+234)' },
  { code: '233', label: 'Ghana (+233)' },
  { code: '254', label: 'Kenya (+254)' },
  { code: '27', label: 'South Africa (+27)' },
  { code: '44', label: 'United Kingdom (+44)' },
  { code: '1', label: 'United States / Canada (+1)' },
  { code: '49', label: 'Germany (+49)' },
  { code: '971', label: 'United Arab Emirates (+971)' },
  { code: '91', label: 'India (+91)' },
];
