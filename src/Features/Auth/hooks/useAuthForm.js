import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, loginSchema, forgotSchema } from "../Schema/userSchema";

export const useAuthForm = (mode) => {
  return useForm({
    resolver: zodResolver(
      mode === "register"
        ? userSchema
        : mode === "login"
          ? loginSchema
          : forgotSchema,
    ),
    defaultValues: {
      role: "buyer",
      email: "",
      password: "",
      confirm_password: "",
      agree_to_terms: true,
    },
    mode: "onTouched",
  });
};
