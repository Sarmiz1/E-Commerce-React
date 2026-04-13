import { motion } from "framer-motion";
import gsap from "gsap";
import { useState, memo, useCallback } from "react";
import { formatMoneyCents } from "../../../../../Utils/formatMoneyCents";
import { postData } from "../../../../../api/postData"; 


const ProductDisplay = memo(({ item, cartIconRef, loadCart }) => {

  const [addCartErrorMessage, setAddCartErrorMessage] = useState('')

  const addToCart = useCallback(async (productID, e) => {

    if (!productID) return;
    const card = e.currentTarget.closest(".se-pc"); const img = card?.querySelector("img");
    if (img && cartIconRef?.current) {
      const ir = img.getBoundingClientRect(); const cr = cartIconRef?.current.getBoundingClientRect();
      const clone = document.createElement("div");
      clone.style.cssText = `position:fixed;top:${ir.top}px;left:${ir.left}px;width:${ir.width}px;height:${ir.height}px;background-image:url('${img.src}');background-size:cover;background-position:center;border-radius:16px;z-index:9999;pointer-events:none;box-shadow:0 8px 32px rgba(79,70,229,0.3);`;
      document.body.appendChild(clone);
      gsap.to(clone, { top: cr.top + cr.height / 2 - 20, left: cr.left + cr.width / 2 - 20, width: 40, height: 40, borderRadius: "50%", opacity: 0, duration: 0.75, ease: "power3.in", onComplete: () => { clone.remove(); if (cartIconRef?.current) gsap.fromTo(cartIconRef?.current, { scale: 1.4 }, { scale: 1, duration: 0.4, ease: "elastic.out(1.2,0.5)" }); } });
    }

    try {
      setAddCartErrorMessage('');

      const productDetails = {
        productId: productID,
        quantity: 1,
      };

      const addToCartUrl = `/api/cart-items`;

      await postData(addToCartUrl, productDetails);

      await loadCart();

    } catch (error) {
      setAddCartErrorMessage("Failed to add item to cart. Please try again.");
      console.log(error)
    }
  }, [loadCart, cartIconRef]);


  const renderStars = (rating = 0) => {
    const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
    return (
      <div className="flex items-center gap-0.5">
        {Array(full).fill().map((_, i) => <span key={`f${i}`} className="text-yellow-400 text-sm">★</span>)}
        {half && <span className="text-yellow-400 text-sm">⯪</span>}
        {Array(empty).fill().map((_, i) => <span key={`e${i}`} className="text-gray-200 text-sm">★</span>)}
        <span className="ml-1.5 text-xs text-gray-400">{rating}</span>
      </div>
    );
  };

  return (
    <motion.div whileHover={{ y: -12, boxShadow: "0 32px 64px rgba(79,70,229,0.15)" }} key={item?.id} className="se-pc group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img src={item?.image} alt={item?.name} className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 px-2.5 py-1 rounded-full shadow-sm">New</div>
      </div>
      <div className="p-6">
        <h4 className="font-bold text-gray-900 mb-2">{item?.name}</h4>
        {renderStars(item?.rating?.stars || 0)}
        <div className="flex items-center justify-between mt-4">
          <p className="font-black text-2xl text-gray-900">{formatMoneyCents(item?.priceCents)}</p>
          <motion.button whileTap={{ scale: 0.93 }} onClick={(e) => addToCart(item.id, e)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-indigo-500/40 hover:shadow-lg transition-all duration-200">+ Cart</motion.button>
        </div>
        {
          addCartErrorMessage &&
          <p className="text-red-500 text-sm font-medium flex justify-center items-center mt-5">
            {addCartErrorMessage}
          </p>
        }
      </div>
    </motion.div>
  )
})

export default ProductDisplay
