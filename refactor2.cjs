const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'src/Features/Product/ProductDetails/ProductDetail.jsx');
const lines = fs.readFileSync(srcFile, 'utf8').split('\n');
const getLines = (start, end) => lines.slice(start - 1, end).join('\n');

const dirComponents = path.join(__dirname, 'src/Features/Product/ProductDetails/Components');

const commonImports = 
"import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';\n" +
"import { motion, AnimatePresence } from 'framer-motion';\n" +
"import gsap from 'gsap';\n" +
"import { Link, useNavigate } from 'react-router-dom';\n" +
"import { formatMoneyCents } from '../../../../Utils/formatMoneyCents';\n" +
"import { useCartActions } from '../../../../Context/cart/CartContext';\n" +
"import { IconSpinner } from '../../../../Components/Icons/IconSpinner';\n" +
"import ProductCard from '../../../../Components/Ui/ProductCard';\n" +
"import { ErrorMessage } from '../../../../Components/ErrorMessage';\n" +
"import { \n" +
"  BagIcon, HeartIcon, ShareIcon, ChevronLeft, ChevronRight, \n" +
"  CheckIcon, SpinnerIcon, ShieldIcon, TruckIcon, RefreshIcon, \n" +
"  BellIcon, CloseIcon, LockIcon \n" +
"} from './Icons';\n" +
"import { \n" +
"  loadReviewerName, saveReviewerName, getAvatarGradient, \n" +
"  computeRatingDistribution, computeDemandScore, generateSparklinePoints, \n" +
"  seededRand, savePriceAlert, hasPriceAlert\n" +
"} from '../Utils/productHelpers';\n" +
"import { useMagnetic } from '../Hooks/useMagnetic';\n\n";

const files = {
  'StarRating.jsx': { lines: [398, 427], extraExports: ['InteractiveStarPicker'] },
  'ProductIntelPanel.jsx': { lines: [429, 546] },
  'ThumbnailGallery.jsx': { lines: [548, 734] },
  'ColorSelector.jsx': { lines: [736, 759] },
  'SizeSelector.jsx': { lines: [761, 788] },
  'AddToCartPanel.jsx': { lines: [790, 853] },
  'ReviewForm.jsx': { lines: [855, 936] },
  'ReviewCard.jsx': { lines: [938, 963] },
  'RatingBreakdown.jsx': { lines: [965, 996], extraImports: "import { StarRating } from './StarRating';\n" },
  'ReviewsSection.jsx': { lines: [998, 1058], extraImports: "import { ReviewForm } from './ReviewForm';\nimport { ReviewCard } from './ReviewCard';\nimport { RatingBreakdown } from './RatingBreakdown';\n" },
  'ProductTabs.jsx': { lines: [1060, 1116] },
  'PriceAlertModal.jsx': { lines: [1118, 1193] },
  'PredictivePairings.jsx': { lines: [1195, 1240] },
  'StickyATCBar.jsx': { lines: [1242, 1288] },
  'ProductNotFound.jsx': { lines: [1290, 1307] }
};

for (const [filename, config] of Object.entries(files)) {
  let content = commonImports;
  if (config.extraImports) content += config.extraImports;
  if (filename === 'ThumbnailGallery.jsx') {
    content += "import { ProductIntelPanel } from './ProductIntelPanel';\n";
  }
  
  let code = getLines(config.lines[0], config.lines[1]);
  code = code.replace(/^function /gm, 'export function ');
  
  fs.writeFileSync(path.join(dirComponents, filename), content + '\n' + code);
}

const productDetailImports = 
"import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';\n" +
"import { useParams, useNavigate, Link } from 'react-router-dom';\n" +
"import { useProductBySlug, useProductRecommendations } from '../Hooks/useProducts';\n" +
"import { motion, AnimatePresence } from 'framer-motion';\n" +
"import gsap from 'gsap';\n" +
"import { ScrollTrigger } from 'gsap/ScrollTrigger';\n" +
"import { IconSpinner } from '../../../../Components/Icons/IconSpinner';\n" +
"import { formatMoneyCents } from '../../../../Utils/formatMoneyCents';\n" +
"import { useProductDetail } from './Hooks/useProductDetail';\n" +
"import { DETAIL_STYLES } from './Styles/DetailStyles';\n" +
"import { HeartIcon, ShareIcon, ChevronLeft, CheckIcon, BellIcon } from './Components/Icons';\n" +
"import { StarRating } from './Components/StarRating';\n" +
"import { ThumbnailGallery } from './Components/ThumbnailGallery';\n" +
"import { ColorSelector } from './Components/ColorSelector';\n" +
"import { SizeSelector } from './Components/SizeSelector';\n" +
"import { AddToCartPanel } from './Components/AddToCartPanel';\n" +
"import { ReviewsSection } from './Components/ReviewsSection';\n" +
"import { ProductTabs } from './Components/ProductTabs';\n" +
"import { PriceAlertModal } from './Components/PriceAlertModal';\n" +
"import { PredictivePairings } from './Components/PredictivePairings';\n" +
"import { StickyATCBar } from './Components/StickyATCBar';\n" +
"import { ProductNotFound } from './Components/ProductNotFound';\n" +
"import { PRODUCT_COLORS, SIZE_MAP, getProductCategory } from './Utils/productHelpers';\n\n" +
"gsap.registerPlugin(ScrollTrigger);\n\n";

const mainCode = getLines(1309, 1602);

const newProductDetailCode = productDetailImports + 
"export default function ProductDetail() {\n" +
"  const { productSlug } = useParams();\n" +
"  const navigate = useNavigate();\n\n" +
"  const { data: product, isFetchingProduct } = useProductBySlug(productSlug);\n" +
"  const { data: predictiveProducts, isFetchingSimilar } = useProductRecommendations(product?.id);\n\n" +
"  const {\n" +
"    isDark,\n" +
"    user,\n" +
"    wishlisted,\n" +
"    shareOpen,\n" +
"    copied,\n" +
"    copyLabel,\n" +
"    reviews,\n" +
"    selectedColor,\n" +
"    setSelectedColor,\n" +
"    selectedSize,\n" +
"    setSelectedSize,\n" +
"    alertOpen,\n" +
"    setAlertOpen,\n" +
"    hasAlert,\n" +
"    setHasAlert,\n" +
"    toggleWishlist,\n" +
"    handleShare,\n" +
"    handleCopyLink,\n" +
"    shareToURL,\n" +
"    handleAddReview,\n" +
"  } = useProductDetail(product);\n\n" +
"  const atcRef = useRef(null);\n" +
"  const [atcOutOfView, setAtcOutOfView] = useState(false);\n" +
"  useEffect(() => {\n" +
"    const el = atcRef.current; if (!el) return;\n" +
"    const obs = new IntersectionObserver(([e]) => setAtcOutOfView(!e.isIntersecting), { threshold: 0.1 });\n" +
"    obs.observe(el); return () => obs.disconnect();\n" +
"  }, []);\n\n" +
"  const imageRef = useRef(null);\n" +
"  const rightRef = useRef(null);\n\n" +
"  useEffect(() => {\n" +
"    if (!product || !imageRef.current || !rightRef.current) return;\n" +
"    const tl = gsap.timeline({ delay: 0.05 });\n" +
"    tl.fromTo(imageRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.85, ease: 'expo.out', clearProps: 'all' })\n" +
"      .fromTo(rightRef.current.querySelectorAll('.pd-r'), { x: 30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power3.out', clearProps: 'all' }, '-=0.6');\n" +
"    return () => tl.kill();\n" +
"  }, [product]);\n\n" +
"  if (!product) return <ProductNotFound />;\n\n" +
"  const category = getProductCategory(product.keywords);\n" +
"  const availableColors = PRODUCT_COLORS[category] || PRODUCT_COLORS.default;\n" +
"  const availableSizes = SIZE_MAP[category] || null;\n" +
"  const sku = 'SE-' + String(product.id || '').slice(0, 8).toUpperCase();\n" +
"  const onSale = product.price_cents < 2000;\n" +
"  const origPrice = onSale ? Math.round(product.price_cents * 1.35) : null;\n" +
"  const lowStock = (product.rating_count || 0) < 50;\n\n" +
"  return (\n" +
"    <div\n" +
"      className=\"pd-root pd-grain min-h-screen pb-36 lg:pb-0\"\n" +
"      data-theme={isDark ? 'dark' : 'light'}\n" +
"      style={{ background: 'var(--pd-page)', color: 'var(--cream)' }}\n" +
"    >\n" +
"      <style>{DETAIL_STYLES}</style>\n\n" +
"      {/* ── HERO ─────────────────────────────────────────────────────── */}\n" +
"      <div className=\"relative pt-20\" style={{ background: 'var(--pd-hero-grad)' }}>\n" +
"        <div className=\"max-w-6xl mx-auto px-6 pt-10 pb-16\">\n\n" +
"          {/* Breadcrumb */}\n" +
"          <nav className=\"flex items-center gap-2 mb-10 text-xs pd-rise-1\" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>\n" +
"            <button onClick={() => navigate('/')} className=\"pd-link-hover transition-colors\" style={{ color: 'var(--mist)' }}>Home</button>\n" +
"            <span style={{ color: 'var(--ash)' }}>·</span>\n" +
"            <button onClick={() => navigate('/products')} className=\"pd-link-hover transition-colors\" style={{ color: 'var(--mist)' }}>Products</button>\n" +
"            {product.keywords?.[0] && (<>\n" +
"              <span style={{ color: 'var(--ash)' }}>·</span>\n" +
"              <button onClick={() => navigate('/products?search=' + product.keywords[0])} className=\"pd-link-hover transition-colors capitalize\" style={{ color: 'var(--mist)' }}>{product.keywords[0]}</button>\n" +
"            </>)}\n" +
"            <span style={{ color: 'var(--ash)' }}>·</span>\n" +
"            <span className=\"line-clamp-1 max-w-[180px]\" style={{ color: 'var(--silver)' }}>{product.name}</span>\n\n" +
"            {/* Loading Spinner when Tanstack is updating fetch */}\n" +
"            <span className=\"ml-4\">{isFetchingProduct && <IconSpinner />}</span>\n" +
"          </nav>\n\n" +
"          {/* ── TWO-COLUMN GRID ─────────────────────────────────────── */}\n" +
"          <div className=\"grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16\">\n\n" +
"            {/* LEFT: Gallery + Intel + Reviews (scrolls with page) */}\n" +
"            <div className=\"lg:col-span-7\">\n" +
"              <ThumbnailGallery product={product} imageRef={imageRef} />\n" +
"              <ReviewsSection product={product} reviews={reviews} onAddReview={handleAddReview} user={user} />\n" +
"            </div>\n\n" +
"            {/* RIGHT: Sticky info + ATC panel */}\n" +
"            <div className=\"lg:col-span-5\">\n" +
"              <div ref={rightRef} className=\"lg:sticky lg:top-[88px] max-h-[calc(100vh-100px)] overflow-y-auto space-y-5 pd-thumbs pr-2 pb-8\">\n\n" +
"                {/* Top action row */}\n" +
"                <div className=\"pd-r flex items-center justify-between\">\n" +
"                  <motion.button whileHover={{ x: -3 }} onClick={() => navigate(-1)}\n" +
"                    className=\"flex items-center gap-1.5 text-xs transition-colors pd-link-hover\" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>\n" +
"                    <ChevronLeft className=\"w-3.5 h-3.5\" /> Back\n" +
"                  </motion.button>\n" +
"                  <div className=\"flex items-center gap-2\">\n" +
"                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleWishlist}\n" +
"                      className=\"w-9 h-9 rounded-full flex items-center justify-center transition-all\"\n" +
"                      style={{ background: wishlisted ? 'rgba(244,63,94,0.1)' : 'var(--pd-s2)', border: '1px solid ' + (wishlisted ? 'rgba(244,63,94,0.3)' : 'var(--pd-b3)'), color: wishlisted ? '#f43f5e' : 'var(--mist)' }}>\n" +
"                      <HeartIcon filled={wishlisted} className=\"w-3.5 h-3.5\" />\n" +
"                    </motion.button>\n" +
"                    <div className=\"relative\">\n" +
"                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleShare}\n" +
"                        className=\"pd-share-btn w-9 h-9 rounded-full flex items-center justify-center transition-all\"\n" +
"                        style={{ background: shareOpen ? 'rgba(201,169,110,0.1)' : 'var(--pd-s2)', border: '1px solid ' + (shareOpen ? 'rgba(201,169,110,0.3)' : 'var(--pd-b3)'), color: shareOpen ? 'var(--gold)' : 'var(--mist)' }}>\n" +
"                        <ShareIcon className=\"w-3.5 h-3.5\" />\n" +
"                      </motion.button>\n" +
"                      <AnimatePresence>\n" +
"                        {shareOpen && (\n" +
"                          <motion.div initial={{ opacity: 0, scale: 0.93, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 6 }} transition={{ duration: 0.18 }}\n" +
"                            className=\"pd-share-panel absolute right-0 top-11 z-[200] rounded-2xl shadow-2xl p-4 w-[220px]\"\n" +
"                            style={{ background: 'var(--pd-overlay)', border: '1px solid var(--pd-b5)' }}>\n" +
"                            <p className=\"pd-chip mb-3 px-1\" style={{ color: 'var(--mist)' }}>Share this item</p>\n" +
"                            <div className=\"space-y-0.5\">\n" +
"                              {[{ id: 'whatsapp', label: 'WhatsApp', bg: '#25D366' }, { id: 'twitter', label: 'X (Twitter)', bg: '#000' }, { id: 'facebook', label: 'Facebook', bg: '#1877f2' }, { id: 'telegram', label: 'Telegram', bg: '#0088cc' }].map(p => (\n" +
"                                <motion.button key={p.id} whileHover={{ x: 3 }} onClick={() => shareToURL(p.id)}\n" +
"                                  className=\"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all\" style={{ color: 'var(--silver)', fontFamily: 'Jost,sans-serif' }}>\n" +
"                                  <span className=\"w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold\" style={{ background: p.bg }}>{p.label[0]}</span>\n" +
"                                  {p.label}\n" +
"                                </motion.button>\n" +
"                              ))}\n" +
"                            </div>\n" +
"                            <div className=\"my-3\" style={{ borderTop: '1px solid var(--pd-b2)' }} />\n" +
"                            <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyLink}\n" +
"                              className=\"w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all\"\n" +
"                              style={{ background: copied ? 'rgba(74,222,128,0.06)' : 'transparent', borderColor: copied ? 'rgba(74,222,128,0.2)' : 'var(--pd-b3)', color: copied ? '#4ade80' : 'var(--silver)', fontFamily: 'Jost,sans-serif' }}>\n" +
"                              {copied ? <><CheckIcon className=\"w-3.5 h-3.5\" />Copied!</> : <><svg className=\"w-3.5 h-3.5\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3\" /></svg>{copyLabel}</>}\n" +
"                            </motion.button>\n" +
"                          </motion.div>\n" +
"                        )}\n" +
"                      </AnimatePresence>\n" +
"                    </div>\n" +
"                  </div>\n" +
"                </div>\n\n" +
"                {/* SKU + keywords */}\n" +
"                <div className=\"pd-r flex flex-wrap items-center gap-2\">\n" +
"                  <span className=\"pd-chip px-2.5 py-1 rounded-md\" style={{ background: 'var(--pd-s2)', color: 'var(--mist)' }}>SKU: {sku}</span>\n" +
"                  {product.keywords?.slice(0, 3).map(kw => (\n" +
"                    <span key={kw} className=\"pd-chip px-2.5 py-1 rounded-md capitalize\" style={{ background: 'rgba(201,169,110,0.08)', color: 'var(--gold)', border: '1px solid rgba(201,169,110,0.15)' }}>{kw}</span>\n" +
"                  ))}\n" +
"                </div>\n\n" +
"                {/* Name */}\n" +
"                <div className=\"pd-r\">\n" +
"                  <h1 className=\"pd-display font-light leading-tight\" style={{ color: 'var(--cream)', fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.015em' }}>\n" +
"                    {product.name}\n" +
"                  </h1>\n" +
"                </div>\n\n" +
"                {/* Seller */}\n" +
"                <div className=\"pd-r\">\n" +
"                  <span className=\"text-xs\" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>Sold by </span>\n" +
"                  <Link to=\"/seller/woosho-store\" className=\"text-xs font-medium pd-link-hover\" style={{ color: 'var(--gold)', fontFamily: 'Jost,sans-serif' }}>woosho Atelier</Link>\n" +
"                </div>\n\n" +
"                {/* Rating */}\n" +
"                {product.rating_stars && (\n" +
"                  <div className=\"pd-r\"><StarRating stars={product.rating_stars} count={product.rating_count} /></div>\n" +
"                )}\n\n" +
"                {/* Price */}\n" +
"                <div className=\"pd-r flex items-baseline gap-4\">\n" +
"                  <span className=\"pd-display font-light\" style={{ fontSize: 'clamp(32px,4vw,44px)', color: 'var(--cream)', letterSpacing: '-0.02em' }}>\n" +
"                    {formatMoneyCents(product.price_cents)}\n" +
"                  </span>\n" +
"                  {origPrice && (<>\n" +
"                    <span className=\"text-lg line-through\" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>{formatMoneyCents(origPrice)}</span>\n" +
"                    <span className=\"pd-chip px-2.5 py-1 rounded-full\" style={{ background: 'rgba(244,63,94,0.1)', color: '#f87171', border: '1px solid rgba(244,63,94,0.2)' }}>\n" +
"                      −{Math.round((1 - product.price_cents / origPrice) * 100)}%\n" +
"                    </span>\n" +
"                  </>)}\n" +
"                  {lowStock && <span className=\"pd-chip px-2.5 py-1 rounded-full\" style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}>Low Stock</span>}\n" +
"                </div>\n\n" +
"                <div className=\"pd-r pd-rule\" />\n\n" +
"                {/* Color */}\n" +
"                <div className=\"pd-r\">\n" +
"                  <ColorSelector availableColors={availableColors} selectedColor={selectedColor} onSelect={setSelectedColor} />\n" +
"                </div>\n\n" +
"                {/* Size */}\n" +
"                {availableSizes && (\n" +
"                  <div className=\"pd-r\">\n" +
"                    <SizeSelector sizes={availableSizes} selectedSize={selectedSize} onSelect={setSelectedSize} />\n" +
"                  </div>\n" +
"                )}\n\n" +
"                {/* ATC */}\n" +
"                <div className=\"pd-r\">\n" +
"                  <AddToCartPanel productId={product.id} variantId={product.variants?.[0]?.id || null} atcRef={atcRef} />\n" +
"                </div>\n\n" +
"                {/* Secondary actions */}\n" +
"                <div className=\"pd-r flex flex-wrap gap-2\">\n" +
"                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setAlertOpen(true)} disabled={hasAlert}\n" +
"                    className=\"flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all\"\n" +
"                    style={{ fontFamily: 'Jost,sans-serif', background: hasAlert ? 'rgba(74,222,128,0.06)' : 'var(--pd-s2)', border: '1px solid ' + (hasAlert ? 'rgba(74,222,128,0.2)' : 'var(--pd-b3)'), color: hasAlert ? '#4ade80' : 'var(--silver)', cursor: hasAlert ? 'default' : 'pointer' }}>\n" +
"                    {hasAlert ? <><CheckIcon className=\"w-3 h-3\" />Alert Set</> : <><BellIcon className=\"w-3 h-3\" />Price Alert</>}\n" +
"                  </motion.button>\n" +
"                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={toggleWishlist}\n" +
"                    className=\"flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all\"\n" +
"                    style={{ fontFamily: 'Jost,sans-serif', background: wishlisted ? 'rgba(244,63,94,0.06)' : 'var(--pd-s2)', border: '1px solid ' + (wishlisted ? 'rgba(244,63,94,0.2)' : 'var(--pd-b3)'), color: wishlisted ? '#f87171' : 'var(--silver)' }}>\n" +
"                    <HeartIcon filled={wishlisted} className=\"w-3 h-3\" />\n" +
"                    {wishlisted ? 'Saved' : 'Save'}\n" +
"                  </motion.button>\n" +
"                </div>\n\n" +
"                {/* Reassurance */}\n" +
"                <div className=\"pd-r flex flex-wrap gap-x-4 gap-y-1.5\">\n" +
"                  {['🔒 Secure checkout', '📦 Ships in 24h', '↩️ Free 30-day returns'].map(t => (\n" +
"                    <span key={t} className=\"text-xs\" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>{t}</span>\n" +
"                  ))}\n" +
"                </div>\n\n" +
"                <div className=\"pd-r pd-rule\" />\n\n" +
"                {/* Tabs */}\n" +
"                <div className=\"pd-r\">\n" +
"                  <ProductTabs product={product} />\n" +
"                </div>\n\n" +
"              </div>\n" +
"            </div>\n" +
"          </div>\n" +
"        </div>\n" +
"      </div>\n\n" +
"      {/* ── PREDICTIVE PAIRINGS ──────────────────────────────────────── */}\n" +
"      <PredictivePairings products={predictiveProducts} />\n\n" +
"      {/* ── PRICE ALERT MODAL ────────────────────────────────────────── */}\n" +
"      <AnimatePresence>\n" +
"        {alertOpen && <PriceAlertModal product={product} onClose={() => { setAlertOpen(false); setHasAlert(hasPriceAlert(product.id)); }} />}\n" +
"      </AnimatePresence>\n\n" +
"      {/* ── STICKY ATC BAR ───────────────────────────────────────────── */}\n" +
"      {/* <StickyATCBar product={product} productId={product.id} variantId={product.variants?.[0]?.id || null} visible={atcOutOfView} /> */}\n" +
"    </div>\n" +
"  );\n" +
"}\n";

fs.writeFileSync(path.join(__dirname, 'src/Features/Product/ProductDetails/ProductDetail.jsx'), newProductDetailCode);

console.log("Refactoring components complete");
