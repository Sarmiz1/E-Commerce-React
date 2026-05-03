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
      full_name: "",
      username: "",
      store_name: "",
      store_type: "electronics",
      phone: "",
      business_description: "",
      agree_to_terms: true,
      same_as_home: true,
      same_as_store: false,
      home_address: {
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Nigeria",
      },
      store_address: {
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Nigeria",
      },
    },
    mode: "onTouched",
  });
};
