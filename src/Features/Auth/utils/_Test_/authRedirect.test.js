import { beforeEach, describe, expect, it } from "vitest";
import {
  consumeAuthReturnTo,
  consumeRequestedAccountRole,
  getSafeAuthReturnTo,
  rememberAuthReturnTo,
  rememberRequestedAccountRole,
} from "../authRedirect";

describe("auth redirect persistence", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("preserves an internal route object through an OAuth round trip", () => {
    rememberAuthReturnTo({
      pathname: "/checkout",
      search: "?source=cart",
      hash: "#payment",
    });

    expect(consumeAuthReturnTo()).toBe("/checkout?source=cart#payment");
    expect(consumeAuthReturnTo()).toBeNull();
  });

  it("rejects protocol-relative and external redirects", () => {
    expect(getSafeAuthReturnTo("//example.com", "/")).toBe("/");
    expect(getSafeAuthReturnTo("https://example.com", "/")).toBe("/");
  });

  it("preserves a supported onboarding role through an OAuth round trip", () => {
    rememberRequestedAccountRole("seller");

    expect(consumeRequestedAccountRole()).toBe("seller");
    expect(consumeRequestedAccountRole()).toBeNull();
  });

  it("rejects unsupported onboarding roles", () => {
    rememberRequestedAccountRole("admin");

    expect(consumeRequestedAccountRole()).toBeNull();
  });
});
