import { describe, expect, it } from "vitest";
import { userSchema } from "../userSchema";

const VALID_ACCOUNT = {
  email: "shopper@example.com",
  password: "StrongPass1!",
  confirm_password: "StrongPass1!",
  agree_to_terms: true,
};

describe("userSchema", () => {
  it.each(["buyer", "seller"])(
    "validates shared account fields for the %s onboarding path",
    (role) => {
      expect(
        userSchema.safeParse({
          ...VALID_ACCOUNT,
          role,
        }).success,
      ).toBe(true);
    },
  );

  it("rejects mismatched passwords", () => {
    const result = userSchema.safeParse({
      ...VALID_ACCOUNT,
      role: "buyer",
      confirm_password: "DifferentPass1!",
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["confirm_password"]);
  });
});
