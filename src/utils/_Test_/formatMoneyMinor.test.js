import { it, expect, describe } from "vitest";
import { formatMoneyMinor } from "../formatMoneyMinor";

describe('formatMoneyMinor', () => {
  it('formats 1999 cents as $19.99', () => {
  expect(formatMoneyMinor(1999)).toBe('$19.99')
})

it('displays 2 decimals', () => {
  expect(formatMoneyMinor(1090)).toBe('$10.90')
  expect(formatMoneyMinor(100)).toBe('$1.00')
})
})
