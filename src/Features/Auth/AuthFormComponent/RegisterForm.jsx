import React from "react";
import { Controller } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import FloatingInput from "../Components/FloatingInput";
import EyeBtn from "../Components/EyeBtn";

const RegisterForm = ({ control, errors, showPass, setShowPass, showConfirm, setShowConfirm, colors, isDark }) => {
  return (
    <>
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
    </>
  );
};

export default RegisterForm;
