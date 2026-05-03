import React from "react";
import { Controller } from "react-hook-form";
import { Mail } from "lucide-react";
import FloatingInput from "../Components/FloatingInput";

const ForgotForm = ({ control, errors, colors, isDark }) => {
  return (
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
  );
};

export default ForgotForm;
