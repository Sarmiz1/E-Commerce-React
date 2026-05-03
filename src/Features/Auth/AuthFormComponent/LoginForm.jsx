import React from "react";
import { Controller } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import FloatingInput from "../Components/FloatingInput";
import EyeBtn from "../Components/EyeBtn";

const LoginForm = ({ control, errors, showPass, setShowPass, colors, isDark, setMode, cta }) => {
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
            autoComplete="current-password"
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
      <div
        style={{
          textAlign: "right",
          marginTop: -2,
          marginBottom: 18,
        }}
      >
        <button
          type="button"
          className="forgot-link"
          onClick={() => setMode("forgot")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: cta,
          }}
        >
          Forgot password?
        </button>
      </div>
    </>
  );
};

export default LoginForm;
