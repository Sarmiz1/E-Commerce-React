export const ADDRESS_COUNTRIES = [
  { code: 'NG', label: 'Nigeria' },
  { code: 'GH', label: 'Ghana' },
  { code: 'KE', label: 'Kenya' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'IN', label: 'India' },
  { code: 'AU', label: 'Australia' },
  { code: 'JP', label: 'Japan' },
];

const ADDRESS_COUNTRY_CODES_BY_ALIAS = new Map(
  ADDRESS_COUNTRIES.flatMap(country => [
    [country.code, country.code],
    [country.label.toUpperCase(), country.code],
  ]).concat([
    ['UK', 'GB'],
    ['USA', 'US'],
    ['UAE', 'AE'],
  ]),
);

export const normalizeAddressCountryCode = value => {
  const country = String(value || '').trim().toUpperCase();
  return ADDRESS_COUNTRY_CODES_BY_ALIAS.get(country) || country;
};

export const getAddressCountryLabel = code => (
  ADDRESS_COUNTRIES.find(country => country.code === normalizeAddressCountryCode(code))?.label || code || 'Country'
);
