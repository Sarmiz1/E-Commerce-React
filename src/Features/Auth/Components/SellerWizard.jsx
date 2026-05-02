import React from "react";
import { Controller } from "react-hook-form";
import { 
  User, Mail, Lock, ChevronLeft, Store, Phone, AlignLeft, MapPin, Building, Flag, Hash 
} from "lucide-react";
import FloatingInput from "./FloatingInput";
import FloatingSelect from "./FloatingSelect";
import EyeBtn from "./EyeBtn";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const SellerWizard = ({
  sellerStep,
  setSellerStep,
  control,
  errors,
  showPass,
  setShowPass,
  showConfirm,
  setShowConfirm,
  watchPassword,
  colors,
  isDark,
  cta,
  CATEGORIES
}) => {
  if (sellerStep === 1) {
    return (
      <>
        <Controller
          name="full_name"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Your Full Name"
              icon={User}
              autoComplete="name"
              colors={colors}
              isDark={isDark}
              error={errors.full_name?.message}
            />
          )}
        />
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Username"
              icon={User}
              autoComplete="username"
              colors={colors}
              isDark={isDark}
              error={errors.username?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Business Email"
              icon={Mail}
              autoComplete="email"
              colors={colors}
              isDark={isDark}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Password"
              type={showPass ? "text" : "password"}
              icon={Lock}
              autoComplete="new-password"
              colors={colors}
              isDark={isDark}
              error={errors.password?.message}
              suffix={
                <EyeBtn
                  show={showPass}
                  toggle={() => setShowPass((s) => !s)}
                  colors={colors}
                />
              }
            />
          )}
        />
        <Controller
          name="confirm_password"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              icon={Lock}
              autoComplete="new-password"
              colors={colors}
              isDark={isDark}
              error={errors.confirm_password?.message}
              suffix={
                <EyeBtn
                  show={showConfirm}
                  toggle={() => setShowConfirm((s) => !s)}
                  colors={colors}
                />
              }
            />
          )}
        />
        <PasswordStrengthMeter password={watchPassword} />
      </>
    );
  }

  if (sellerStep === 2) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <button
            onClick={() => setSellerStep(1)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: colors.text.tertiary,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: cta }}>
            Step 2 of 4
          </span>
        </div>
        <Controller
          name="store_name"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Store / Business Name"
              icon={Store}
              autoComplete="organization"
              colors={colors}
              isDark={isDark}
              error={errors.store_name?.message}
            />
          )}
        />
        <Controller
          name="store_type"
          control={control}
          render={({ field }) => (
            <FloatingSelect
              {...field}
              label="Business Category"
              options={CATEGORIES}
              colors={colors}
              isDark={isDark}
              error={errors.store_type?.message}
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Phone Number (WhatsApp)"
              icon={Phone}
              autoComplete="tel"
              colors={colors}
              isDark={isDark}
              error={errors.phone?.message}
            />
          )}
        />
        <Controller
          name="business_description"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Business Description"
              icon={AlignLeft}
              colors={colors}
              isDark={isDark}
              error={errors.business_description?.message}
              multiline
            />
          )}
        />
      </>
    );
  }

  if (sellerStep === 3) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <button
            onClick={() => setSellerStep(2)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: colors.text.tertiary,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: cta }}>
            Step 3 of 4
          </span>
        </div>
        <Controller
          name="home_address.street"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Home Street Address"
              icon={MapPin}
              autoComplete="street-address"
              colors={colors}
              isDark={isDark}
              error={errors.home_address?.street?.message}
            />
          )}
        />
        <Controller
          name="home_address.city"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="City"
              icon={Building}
              autoComplete="address-level2"
              colors={colors}
              isDark={isDark}
              error={errors.home_address?.city?.message}
            />
          )}
        />
        <Controller
          name="home_address.state"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="State / Province"
              icon={MapPin}
              autoComplete="address-level1"
              colors={colors}
              isDark={isDark}
              error={errors.home_address?.state?.message}
            />
          )}
        />
        <Controller
          name="home_address.country"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Country"
              icon={Flag}
              autoComplete="country-name"
              colors={colors}
              isDark={isDark}
              error={errors.home_address?.country?.message}
            />
          )}
        />
        <Controller
          name="home_address.zip_code"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Zip / Postal Code"
              icon={Hash}
              autoComplete="postal-code"
              colors={colors}
              isDark={isDark}
              error={errors.home_address?.zip_code?.message}
            />
          )}
        />
      </>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={() => setSellerStep(3)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: colors.text.tertiary,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: cta }}>
          Step 4 of 4
        </span>
      </div>
      <Controller
        name="store_address.street"
        control={control}
        render={({ field }) => (
          <FloatingInput
            {...field}
            label="Store Street Address"
            icon={MapPin}
            autoComplete="street-address"
            colors={colors}
            isDark={isDark}
            error={errors.store_address?.street?.message}
          />
        )}
      />
      <Controller
        name="store_address.city"
        control={control}
        render={({ field }) => (
          <FloatingInput
            {...field}
            label="Store City"
            icon={Building}
            autoComplete="address-level2"
            colors={colors}
            isDark={isDark}
            error={errors.store_address?.city?.message}
          />
        )}
      />
      <Controller
        name="store_address.state"
        control={control}
        render={({ field }) => (
          <FloatingInput
            {...field}
            label="Store State / Province"
            icon={MapPin}
            autoComplete="address-level1"
            colors={colors}
            isDark={isDark}
            error={errors.store_address?.state?.message}
          />
        )}
      />
      <Controller
        name="store_address.country"
        control={control}
        render={({ field }) => (
          <FloatingInput
            {...field}
            label="Store Country"
            icon={Flag}
            autoComplete="country-name"
            colors={colors}
            isDark={isDark}
            error={errors.store_address?.country?.message}
          />
        )}
      />
      <Controller
        name="store_address.zip_code"
        control={control}
        render={({ field }) => (
          <FloatingInput
            {...field}
            label="Store Zip / Postal Code"
            icon={Hash}
            autoComplete="postal-code"
            colors={colors}
            isDark={isDark}
            error={errors.store_address?.zip_code?.message}
          />
        )}
      />
    </>
  );
};

export default SellerWizard;
