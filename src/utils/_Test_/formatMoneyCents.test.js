import { it, expect, describe } from "vitest";
import { formatMoneyCents } from "../FormatMoneyCents";

describe('formatMoneyCents', () => {
  it('formats 1999 cents as $19.99', () => {
  expect(formatMoneyCents(1999)).toBe('$19.99')
})

it('displays 2 decimals', () => {
  expect(formatMoneyCents(1090)).toBe('$10.90')
  expect(formatMoneyCents(100)).toBe('$1.00')
})
})
