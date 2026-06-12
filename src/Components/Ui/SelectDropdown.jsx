import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const normalizeOption = (option) => {
  if (typeof option === "string") return { label: option, value: option };
  return {
    label: option?.label ?? option?.value ?? "",
    value: option?.value ?? option?.label ?? "",
    description: option?.description,
    disabled: Boolean(option?.disabled),
  };
};

export default function SelectDropdown({
  value,
  options = [],
  onChange,
  placeholder = "Select option",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  error = false,
  disabled = false,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const normalizedOptions = useMemo(() => {
    const normalized = options.map(normalizeOption);
    if (value && !normalized.some((option) => option.value === value)) {
      return [{ label: value, value }, ...normalized];
    }
    return normalized;
  }, [options, value]);
  const selected = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const chooseOption = (option) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <style>{`
        @keyframes select-dropdown-menu-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .select-dropdown-menu::-webkit-scrollbar { width: 6px; }
        .select-dropdown-menu::-webkit-scrollbar-track { background: transparent; }
        .select-dropdown-menu::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.4);
          border-radius: 9999px;
        }
        .dark .select-dropdown-menu::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.12);
        }
      `}</style>

      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-gray-950 ${
          error
            ? "border-red-300 bg-red-50 text-red-900 hover:border-red-400 dark:border-red-500/50 dark:bg-red-950/20 dark:text-red-100 dark:hover:border-red-500/70"
            : open
            ? "border-indigo-400 bg-white text-gray-900 ring-2 ring-indigo-500/15 dark:border-indigo-400/60 dark:bg-gray-900 dark:text-gray-100"
            : "border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:border-white/20 dark:hover:bg-white/[0.07]"
        } ${buttonClassName}`}
      >
        <span
          className={`truncate transition-colors ${
            selected?.value
              ? "font-medium text-gray-900 dark:text-gray-100"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-all duration-200 ${
            open
              ? "rotate-180 text-indigo-500 dark:text-indigo-400"
              : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          style={{ animation: "select-dropdown-menu-in 0.16s cubic-bezier(0.16, 1, 0.3, 1)" }}
          className={`select-dropdown-menu absolute z-[70] mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-gray-200/80 bg-white/95 p-1.5 shadow-2xl shadow-gray-900/10 ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/95 dark:shadow-black/40 dark:ring-white/5 ${menuClassName}`}
        >
          {normalizedOptions.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
              No options available
            </div>
          )}

          {normalizedOptions.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value || "empty"}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                onClick={() => chooseOption(option)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : "text-gray-700 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-white/[0.06]"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {option.label || placeholder}
                  </span>
                  {option.description && (
                    <span
                      className={`mt-0.5 block truncate text-xs ${
                        active ? "text-indigo-400 dark:text-indigo-300/70" : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {option.description}
                    </span>
                  )}
                </span>
                {active && (
                  <Check className="h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}