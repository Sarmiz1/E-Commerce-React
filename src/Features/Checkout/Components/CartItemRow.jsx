import { motion } from "framer-motion";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import {
  getCartItemImage,
  getCartItemLineTotal,
  getCartItemName,
  getCartItemQuantity,
  getCartItemUnitPrice,
} from "../Utils/checkoutUtils";
import { Icon } from "./CheckoutIcons";

export function CartItemRow({ item, onUpdateQty, onRemove, removing, updating }) {
  const image = getCartItemImage(item);
  const name = getCartItemName(item);
  const quantity = getCartItemQuantity(item);
  const busy = removing || updating;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.28 }}
      className={`flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-indigo-100 hover:shadow-sm ${busy ? "pointer-events-none opacity-50" : ""}`}
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "https://placehold.co/200x200?text=No+Image";
            }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-black uppercase tracking-widest text-gray-300">Item</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">{name}</p>
        <p className="mt-1 text-base font-black text-indigo-700">{formatMoneyCents(getCartItemLineTotal(item))}</p>
        <p className="text-[11px] text-gray-400">{formatMoneyCents(getCartItemUnitPrice(item))} each</p>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQty(item, -1)}
            disabled={quantity <= 1}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-black text-gray-600 transition hover:bg-gray-200 disabled:opacity-30"
            aria-label={`Decrease ${name} quantity`}
          >
            -
          </button>
          <span className="w-6 text-center text-sm font-black text-gray-900">{quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQty(item, 1)}
            disabled={quantity >= 10}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-black text-gray-600 transition hover:bg-gray-200 disabled:opacity-30"
            aria-label={`Increase ${name} quantity`}
          >
            +
          </button>
        </div>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(item)}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-300 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
        aria-label={`Remove ${name}`}
      >
        <Icon.Trash className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}
