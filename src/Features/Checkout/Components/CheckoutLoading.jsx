import { Icon } from "./CheckoutIcons";

export function CheckoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <Icon.Spin className="h-10 w-10 animate-spin text-indigo-500" />
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Loading your bag...</p>
    </div>
  );
}
