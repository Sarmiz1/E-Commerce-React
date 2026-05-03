import React from "react";
import { Controller } from "react-hook-form";
import { User, Mail, Lock, ChevronLeft, MapPin, Building, Flag, Hash } from "lucide-react";
import FloatingInput from "../Components/FloatingInput";
import EyeBtn from "../Components/EyeBtn";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const BuyerWizard = ({
  buyerStep,
  setBuyerStep,
  control,
  errors,
  showPass,
  setShowPass,
  showConfirm,
  setShowConfirm,
  watchPassword,
  colors,
  isDark,
  cta
}) => {
  if (buyerStep === 1) {
    return (
      <>
        <Controller
          name="full_name"
          control={control}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Full Name"
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
              label="Email Address"
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

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={() => setBuyerStep(1)}
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
          Step 2 of 2
        </span>
      </div>
      <Controller
        name="home_address.street"
        control={control}
        render={({ field }) => (
          <FloatingInput
            {...field}
            label="Street Address"
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
};

export default BuyerWizard;
