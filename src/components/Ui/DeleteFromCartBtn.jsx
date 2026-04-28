import { motion as Motion } from "framer-motion";
import { TrashIcon } from "../Icons/TrashIcon";
import { useCartActions } from "../../Context/cart/CartContext";


export const DeleteFromCartBtn = ({ itemId }) => {
  const { 
    removeItem,
    removingItem } = useCartActions();

  const isRemoving = removingItem === true || removingItem === itemId;

  return (
    <Motion.button
      whileTap={{ scale: 0.9 }}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        removeItem(itemId);
      }}
      disabled={isRemoving}
      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5"
      aria-label="Remove item from cart"
    >
      { isRemoving ? (
        <span className="text-[10px] text-red-400">...</span>
      ) : (
        <TrashIcon className="w-3 h-3 text-red-400 dark:text-red-500" />
      )}
    </Motion.button>
  )
}

export default DeleteFromCartBtn;
