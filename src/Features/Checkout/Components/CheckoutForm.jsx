import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { COUNTRY_OPTIONS } from "../Utils/checkoutConstants";
import { detectCardType } from "../Utils/checkoutUtils";
import { CardTypeBadge } from "./CardTypeBadge";
import { Field } from "./Field";
import { Icon } from "./CheckoutIcons";

const INPUT_BASE =
  "w-full co-input rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400";

function DeliveryFields({ form, errors, onChange }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Icon.Truck className="h-5 w-5 text-indigo-500" />
        <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
          Delivery Information
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" error={errors.name} required>
          <input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="John Doe"
            className={`${INPUT_BASE} ${errors.name ? "error" : ""}`}
          />
        </Field>
        <Field label="Email" error={errors.email} required>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="john@example.com"
            className={`${INPUT_BASE} ${errors.email ? "error" : ""}`}
          />
        </Field>
        <Field label="Phone Number" error={errors.phone} required>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            placeholder="+1 (555) 000-0000"
            className={`${INPUT_BASE} ${errors.phone ? "error" : ""}`}
          />
        </Field>
        <Field label="Country" error={errors.country} required>
          <select
            value={form.country}
            onChange={(event) => onChange("country", event.target.value)}
            className={`${INPUT_BASE} cursor-pointer ${errors.country ? "error" : ""}`}
          >
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </Field>
        <Field label="Street Address" error={errors.address} required>
          <input
            value={form.address}
            onChange={(event) => onChange("address", event.target.value)}
            placeholder="123 Main Street, Apt 4B"
            className={`${INPUT_BASE} ${errors.address ? "error" : ""}`}
          />
        </Field>
        <Field label="City" error={errors.city} required>
          <input
            value={form.city}
            onChange={(event) => onChange("city", event.target.value)}
            placeholder="Lagos"
            className={`${INPUT_BASE} ${errors.city ? "error" : ""}`}
          />
        </Field>
        <Field label="ZIP / Postal Code" error={errors.zip} required>
          <input
            value={form.zip}
            onChange={(event) => onChange("zip", event.target.value)}
            placeholder="100001"
            className={`${INPUT_BASE} ${errors.zip ? "error" : ""}`}
          />
        </Field>
      </div>
    </div>
  );
}

function PaymentFields({ form, errors, onChange }) {
  const cardType = detectCardType(form.cardNumber);

  const handleCardNumber = (event) => {
    const raw = event.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    onChange("cardNumber", formatted);
  };

  const handleExpiry = (event) => {
    const raw = event.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted =
      raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    onChange("expiry", formatted);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon.Lock className="h-5 w-5 text-indigo-500" />
          <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
            Payment Details
          </h3>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
          <Icon.Lock className="h-3 w-3" /> 256-bit SSL
        </span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["visa", "mastercard", "amex", "discover"].map((type) => (
          <span
            key={type}
            className={`whitespace-nowrap rounded-lg border px-2 py-1 text-[9px] font-black transition-all duration-200 sm:px-2.5 sm:py-1.5 ${
              cardType === type
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500"
            }`}
          >
            {type.toUpperCase()}
          </span>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Cardholder Name" error={errors.cardName} required>
            <input
              value={form.cardName}
              onChange={(event) => onChange("cardName", event.target.value)}
              placeholder="John Doe"
              className={`${INPUT_BASE} ${errors.cardName ? "error" : ""}`}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Card Number" error={errors.cardNumber} required>
            <div className="relative">
              <input
                value={form.cardNumber}
                onChange={handleCardNumber}
                placeholder="1234 5678 9012 3456"
                className={`${INPUT_BASE} pr-20 font-mono tracking-widest ${errors.cardNumber ? "error" : ""}`}
                maxLength={19}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
                <CardTypeBadge type={cardType} />
              </div>
            </div>
          </Field>
        </div>
        <Field label="Expiry Date" error={errors.expiry} required>
          <input
            value={form.expiry}
            onChange={handleExpiry}
            placeholder="MM/YY"
            className={`${INPUT_BASE} font-mono ${errors.expiry ? "error" : ""}`}
            maxLength={5}
          />
        </Field>
        <Field label="CVV" error={errors.cvv} required>
          <input
            value={form.cvv}
            onChange={(event) =>
              onChange("cvv", event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="123"
            type="password"
            className={`${INPUT_BASE} font-mono tracking-widest ${errors.cvv ? "error" : ""}`}
            maxLength={4}
          />
        </Field>
      </div>

      <div className="mb-5 border-t border-gray-100 dark:border-white/10 pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon.MapPin className="h-5 w-5 text-indigo-500" />
          <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
            Billing Address
          </h3>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-4 transition-all hover:border-indigo-100 hover:bg-indigo-50/50">
          <input
            type="checkbox"
            checked={form.billingSameAsShipping}
            onChange={(e) =>
              onChange("billingSameAsShipping", e.target.checked)
            }
            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Same as shipping address
          </span>
        </label>

        <AnimatePresence>
          {!form.billingSameAsShipping && (
            <motion.div
              key="billing-fields"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl bg-gray-50/50 dark:bg-white/5 p-5 border border-gray-100 dark:border-white/10">
                <div className="sm:col-span-2">
                  <Field
                    label="Street Address"
                    error={errors.billingAddress}
                    required
                  >
                    <input
                      value={form.billingAddress}
                      onChange={(event) =>
                        onChange("billingAddress", event.target.value)
                      }
                      placeholder="123 Main Street, Apt 4B"
                      className={`${INPUT_BASE} ${errors.billingAddress ? "error" : ""}`}
                    />
                  </Field>
                </div>
                <Field label="City" error={errors.billingCity} required>
                  <input
                    value={form.billingCity}
                    onChange={(event) =>
                      onChange("billingCity", event.target.value)
                    }
                    placeholder="Lagos"
                    className={`${INPUT_BASE} ${errors.billingCity ? "error" : ""}`}
                  />
                </Field>
                <Field
                  label="ZIP / Postal Code"
                  error={errors.billingZip}
                  required
                >
                  <input
                    value={form.billingZip}
                    onChange={(event) =>
                      onChange("billingZip", event.target.value)
                    }
                    placeholder="100001"
                    className={`${INPUT_BASE} ${errors.billingZip ? "error" : ""}`}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Country" error={errors.billingCountry} required>
                    <select
                      value={form.billingCountry}
                      onChange={(event) =>
                        onChange("billingCountry", event.target.value)
                      }
                      className={`${INPUT_BASE} cursor-pointer ${errors.billingCountry ? "error" : ""}`}
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country}>{country}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function CheckoutForm({ form, errors, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <DeliveryFields form={form} errors={errors} onChange={onChange} />
      <PaymentFields form={form} errors={errors} onChange={onChange} />

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={
          !loading
            ? { scale: 1.02, boxShadow: "0 16px 40px rgba(99,102,241,0.35)" }
            : {}
        }
        whileTap={!loading ? { scale: 0.97 } : {}}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Icon.Spin className="h-5 w-5 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Icon.Lock className="h-5 w-5" /> Place Order Securely{" "}
            <Icon.Arrow className="h-4 w-4" />
          </>
        )}
      </motion.button>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        By placing your order you agree to our{" "}
        <Link to="/terms" className="text-indigo-500 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-indigo-500 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
