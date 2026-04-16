// import { motion } from "framer-motion"
// import { formatMoneyCents } from "../../../Utils/formatMoneyCents" 

// const ProductDisplay = ({ item }) => {

//   const price = item?.product.priceCents || 0;
//   const lineTotal = price * item.quantity;

//   return (
//     <div className="flex gap-4 items-start">
//       {/* Product image */}
//       <Link to={`/products/${item.product?.id}`} className="flex-shrink-0">
//         <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 hover:scale-105 transition-transform duration-300">
//           {item.product?.image && (
//             <img src={item.product.image} alt={item.product.name}
//               className="w-full h-full object-cover" loading="lazy" />
//           )}
//         </div>
//       </Link>

//       {/* Details */}
//       <div className="flex-1 min-w-0">
//         <Link to={`/products/${item.product?.id}`}>
//           <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-indigo-700 transition-colors">
//             {item.product?.name || "Product"}
//           </p>
//         </Link>

//         {/* Star rating */}
//         {item.product?.rating?.stars > 0 && (
//           <div className="flex items-center gap-1 mt-1">
//             {Array(5).fill(0).map((_, i) => (
//               <svg key={i} className={`w-3 h-3 ${i < Math.floor(item.product.rating.stars) ? "text-yellow-400" : "text-gray-200"}`}
//                 fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//               </svg>
//             ))}
//             <span className="text-gray-400 text-[10px] ml-0.5">({item.product.rating.count})</span>
//           </div>
//         )}

//         <p className="text-indigo-600 font-black text-base mt-2">
//           {formatMoneyCents(price)}
//           <span className="text-gray-400 text-xs font-normal ml-1">each</span>
//         </p>

//         {/* Qty stepper */}
//         <div className="flex items-center gap-2 mt-3">
//           <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl">
//             <QtyStepperButton dir="minus" disabled={item.quantity <= 1 || pendingQty}
//               onClick={() => onQtyChange(item.id, item.quantity - 1)} />
//             <div className="relative overflow-hidden w-7 text-center tabular-nums font-black text-sm text-gray-900 select-none">
//               {pendingQty ? <Spinner c="w-3 h-3 mx-auto" /> : (
//                 <MechanicalDigit value={item.quantity} prevValue={prevQty} />
//               )}
//             </div>
//             <QtyStepperButton dir="plus" disabled={item.quantity >= 10 || pendingQty}
//               onClick={() => onQtyChange(item.id, item.quantity + 1)} />
//           </div>

//           {/* Save for later */}
//           <button onClick={() => onSaveLater(item)}
//             className="flex items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors text-xs font-semibold">
//             <Ic.Heart c="w-3.5 h-3.5" /> Save
//           </button>
//         </div>
//       </div>

//       {/* Line total + remove */}
//       <div className="flex flex-col items-end gap-2 flex-shrink-0">
//         <p className="font-black text-gray-900 text-base">{formatMoneyCents(lineTotal)}</p>
//         <motion.button
//           whileHover={{ scale: 1.12, color: "#ef4444" }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => onRemove(item.id, item.product?.name)}
//           disabled={isRemoving}
//           className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
//         >
//           {isRemoving ? <Spinner c="w-4 h-4" /> : <Ic.Trash c="w-4 h-4" />}
//         </motion.button>
//       </div>
//     </div>
//   )
// }

// export default ProductDisplay
