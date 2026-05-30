import { motion as Motion } from "framer-motion";
import { TrashIcon } from "../Icons/TrashIcon";
import { useCartActions } from "../../context/cart/CartContext";


export const DeleteFromCartBtn = ({ itemId, itemRef = itemId }) => {
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
        removeItem(itemRef);
      }}
      disabled={isRemoving}
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-50 opacity-100 transition-opacity hover:bg-red-100 focus-visible:opacity-100 dark:bg-red-900/20 md:h-6 md:w-6 md:opacity-0 md:group-hover:opacity-100 mt-0.5"
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
