// npm i class-variance-authority @radix-ui/react-slot tailwind-merge --save clsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils"
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        dark: "bg-slate-900 text-white",
        primary:
          "bg-greenPry text-white shadow-3xl hover:outline hover:outline-2",
        secondary: "bg-greenPry text-white hover:opacity-80 mb-3",
        destructive: "bg-red-500 text-white hover:bg-red-700",
        ok: "bg-greenPry text-white border border-solid [box-shadow: 0 2px 5px rgba(220, 220, 220, 0.5)] hover:bg-greenPry/85 hover:border hover:border-solid hover:border-transparent hover:opacity-95",

        ghost: "bg-gray-50 hover:bg-gray-100 text-gray-700",
        purity: "bg-white text-black border border-solid hover:bg-slate-50 hover:outline-[0.5px] shadow-sm",
        link: "bg-transparent text-indigo-600",
        outline: "bg-transparent border border-gray-300 text-gray-700",
      },
      size: {
        default: "p-4",
        sm: "px-4 py-2",
        lg: "px-14 py-4 ",
        xl: "text-base p-4 w-full mt-[1px]'",
        xxl: "w-36 text-base p-[8px]",
        icon: "size-12",
        full: "w-full h-12",
        auto: "w-auto h-auto",
        custom: "w-36 text-base p-[8px]  mb-2 md:w-[180px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export const ButtonPrimary = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

ButtonPrimary.displayName = "Button";
