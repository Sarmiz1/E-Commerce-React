import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { COUNTRY_OPTIONS } from "../utils/checkoutConstants";
import { Field } from "./Field";
import { Icon } from "./CheckoutIcons";

const INPUT_BASE =
  "w-full co-input rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400";

const CITY_OPTIONS = {
  Nigeria: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu"],
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Atlanta"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary"],
  Germany: ["Berlin", "Munich", "Hamburg", "Frankfurt"],
  France: ["Paris", "Lyon", "Marseille", "Nice"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth"],
  Ghana: ["Accra", "Kumasi", "Takoradi"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu"],
  India: ["Mumbai", "Delhi", "Bengaluru", "Chennai"],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah"],
};

const POSTAL_HINTS = {
  Nigeria: { label: "Postal Code", placeholder: "100001" },
  "United States": { label: "ZIP Code", placeholder: "10001" },
  "United Kingdom": { label: "Postcode", placeholder: "SW1A 1AA" },
  Canada: { label: "Postal Code", placeholder: "M5V 2T6" },
  default: { label: "ZIP / Postal Code", placeholder: "Postal code" },
};

function CustomSelect({ value, options, onChange, className = "" }) {
  const normalizedOptions = value && !options.includes(value)
    ? [value, ...options]
    : options;

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${INPUT_BASE} cursor-pointer appearance-none ${className}`}
    >
      {normalizedOptions.map((option) => (
        <option key={option || "empty"} value={option}>
          {option || "Select city"}
        </option>
      ))}
    </select>
  );
}

function DeliveryFields({ form, errors, onChange }) {
  const cityOptions = CITY_OPTIONS[form.country] || [];
  const postal = POSTAL_HINTS[form.country] || POSTAL_HINTS.default;

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
          <CustomSelect
            value={form.country}
            options={COUNTRY_OPTIONS}
            onChange={(value) => {
              onChange("country", value);
              onChange("city", "");
            }}
            className={errors.country ? "error" : ""}
          />
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
          <CustomSelect
            value={form.city}
            options={["", ...cityOptions]}
            onChange={(value) => onChange("city", value)}
            className={errors.city ? "error" : ""}
          />
        </Field>
        <Field label={postal.label} error={errors.zip} required>
          <input
            value={form.zip}
            onChange={(event) => onChange("zip", event.target.value)}
            placeholder={postal.placeholder}
            className={`${INPUT_BASE} ${errors.zip ? "error" : ""}`}
          />
        </Field>
      </div>
    </div>
  );
}

function PaymentFields({ form, errors, onChange, paymentMethods = [] }) {
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

      <div className="mb-8 space-y-3">
        {[...paymentMethods, { id: "new", brand: "Paystack", last4: "New card", expiry: "Hosted checkout" }].map((method) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
              form.paymentMethodId === method.id
                ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30"
                : "border-gray-100 bg-white hover:border-indigo-100 dark:border-white/10 dark:bg-white/5"
            }`}
          >
            <input
              checked={form.paymentMethodId === method.id}
              className="h-4 w-4 accent-indigo-600"
              name="paymentMethodId"
              onChange={() => onChange("paymentMethodId", method.id)}
              type="radio"
            />
            <span className="flex-1">
              <span className="block text-sm font-black text-gray-900 dark:text-gray-100">
                {method.id === "new" ? "Use a new card with Paystack" : `${method.brand || "Card"} ending ${method.last4}`}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {method.id === "new" ? "Card details are entered securely on Paystack." : `Expires ${method.expiry || "saved"}`}
              </span>
            </span>
          </label>
        ))}
        {errors.paymentMethodId && <p className="text-xs text-red-500">{errors.paymentMethodId}</p>}
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
                    <CustomSelect
                      value={form.billingCountry}
                      options={COUNTRY_OPTIONS}
                      onChange={(value) => onChange("billingCountry", value)}
                      className={errors.billingCountry ? "error" : ""}
                    />
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

export function CheckoutForm({ form, errors, onChange, onSubmit, loading, paymentMethods = [] }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <DeliveryFields form={form} errors={errors} onChange={onChange} />
      <PaymentFields form={form} errors={errors} onChange={onChange} paymentMethods={paymentMethods} />

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={
          !loading
            ? { scale: 1.02, boxShadow: "0 16px 40px rgba(99,102,241,0.35)" }
            : {}
        }
        whileTap={!loading ? { scale: 0.97 } : {}}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-black text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Icon.Spin className="h-5 w-5 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Icon.Lock className="h-5 w-5" /> Proceed to Paystack{" "}
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
