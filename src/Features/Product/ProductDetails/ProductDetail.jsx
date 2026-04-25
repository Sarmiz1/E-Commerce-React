import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductBySlug, useProductRecommendations } from '../Hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IconSpinner } from '../../../Components/Icons/IconSpinner';
import { formatMoneyCents } from '../../../Utils/formatMoneyCents';
import { useProductDetail } from './Hooks/useProductDetail';
import { DETAIL_STYLES } from './Styles/DetailStyles';
import { HeartIcon, ShareIcon, ChevronLeft, CheckIcon, BellIcon } from './Components/Icons';
import { StarRating } from './Components/StarRating';
import { ThumbnailGallery } from './Components/ThumbnailGallery';
import { ColorSelector } from './Components/ColorSelector';
import { SizeSelector } from './Components/SizeSelector';
import { AddToCartPanel } from './Components/AddToCartPanel';
import { ReviewsSection } from './Components/ReviewsSection';
import { ProductTabs } from './Components/ProductTabs';
import { PriceAlertModal } from './Components/PriceAlertModal';
import { PredictivePairings } from './Components/PredictivePairings';
import { StickyATCBar } from './Components/StickyATCBar';
import { ProductNotFound } from './Components/ProductNotFound';
import { PRODUCT_COLORS, SIZE_MAP, getProductCategory } from './Utils/productHelpers';

gsap.registerPlugin(ScrollTrigger);

export default function ProductDetail() {
  const { productSlug } = useParams();
  const navigate = useNavigate();

  const { data: product, isFetchingProduct } = useProductBySlug(productSlug);
  const { data: predictiveProducts, isFetchingSimilar } = useProductRecommendations(product?.id);

  const {
    isDark,
    user,
    wishlisted,
    shareOpen,
    copied,
    copyLabel,
    reviews,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    alertOpen,
    setAlertOpen,
    hasAlert,
    setHasAlert,
    toggleWishlist,
    handleShare,
    handleCopyLink,
    shareToURL,
    handleAddReview,
  } = useProductDetail(product);

  const atcRef = useRef(null);
  const [atcOutOfView, setAtcOutOfView] = useState(false);
  useEffect(() => {
    const el = atcRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => setAtcOutOfView(!e.isIntersecting), { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const imageRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    if (!product || !imageRef.current || !rightRef.current) return;
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo(imageRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.85, ease: 'expo.out', clearProps: 'all' })
      .fromTo(rightRef.current.querySelectorAll('.pd-r'), { x: 30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power3.out', clearProps: 'all' }, '-=0.6');
    return () => tl.kill();
  }, [product]);

  if (!product) return <ProductNotFound />;

  const category = getProductCategory(product.keywords);
  const availableColors = PRODUCT_COLORS[category] || PRODUCT_COLORS.default;
  const availableSizes = SIZE_MAP[category] || null;
  const sku = 'SE-' + String(product.id || '').slice(0, 8).toUpperCase();
  const onSale = product.price_cents < 2000;
  const origPrice = onSale ? Math.round(product.price_cents * 1.35) : null;
  const lowStock = (product.rating_count || 0) < 50;

  return (
    <div
      className="pd-root pd-grain min-h-screen pb-36 lg:pb-0"
      data-theme={isDark ? 'dark' : 'light'}
      style={{ background: 'var(--pd-page)', color: 'var(--cream)' }}
    >
      <style>{DETAIL_STYLES}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative pt-20" style={{ background: 'var(--pd-hero-grad)' }}>
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-10 text-xs pd-rise-1" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>
            <button onClick={() => navigate('/')} className="pd-link-hover transition-colors" style={{ color: 'var(--mist)' }}>Home</button>
            <span style={{ color: 'var(--ash)' }}>·</span>
            <button onClick={() => navigate('/products')} className="pd-link-hover transition-colors" style={{ color: 'var(--mist)' }}>Products</button>
            {product.keywords?.[0] && (<>
              <span style={{ color: 'var(--ash)' }}>·</span>
              <button onClick={() => navigate('/products?search=' + product.keywords[0])} className="pd-link-hover transition-colors capitalize" style={{ color: 'var(--mist)' }}>{product.keywords[0]}</button>
            </>)}
            <span style={{ color: 'var(--ash)' }}>·</span>
            <span className="line-clamp-1 max-w-[180px]" style={{ color: 'var(--silver)' }}>{product.name}</span>

            {/* Loading Spinner when Tanstack is updating fetch */}
            <span className="ml-4">{isFetchingProduct && <IconSpinner />}</span>
          </nav>

          {/* ── TWO-COLUMN GRID ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* LEFT: Gallery + Intel + Reviews (scrolls with page) */}
            <div className="lg:col-span-7">
              <ThumbnailGallery product={product} imageRef={imageRef} />
              <ReviewsSection product={product} reviews={reviews} onAddReview={handleAddReview} user={user} />
            </div>

            {/* RIGHT: Sticky info + ATC panel */}
            <div className="lg:col-span-5">
              <div ref={rightRef} className="lg:sticky lg:top-[88px] max-h-[calc(100vh-100px)] overflow-y-auto space-y-5 pd-thumbs pr-2 pb-8">

                {/* Top action row */}
                <div className="pd-r flex items-center justify-between">
                  <motion.button whileHover={{ x: -3 }} onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs transition-colors pd-link-hover" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </motion.button>
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleWishlist}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{ background: wishlisted ? 'rgba(244,63,94,0.1)' : 'var(--pd-s2)', border: '1px solid ' + (wishlisted ? 'rgba(244,63,94,0.3)' : 'var(--pd-b3)'), color: wishlisted ? '#f43f5e' : 'var(--mist)' }}>
                      <HeartIcon filled={wishlisted} className="w-3.5 h-3.5" />
                    </motion.button>
                    <div className="relative">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleShare}
                        className="pd-share-btn w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{ background: shareOpen ? 'rgba(201,169,110,0.1)' : 'var(--pd-s2)', border: '1px solid ' + (shareOpen ? 'rgba(201,169,110,0.3)' : 'var(--pd-b3)'), color: shareOpen ? 'var(--gold)' : 'var(--mist)' }}>
                        <ShareIcon className="w-3.5 h-3.5" />
                      </motion.button>
                      <AnimatePresence>
                        {shareOpen && (
                          <motion.div initial={{ opacity: 0, scale: 0.93, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 6 }} transition={{ duration: 0.18 }}
                            className="pd-share-panel absolute right-0 top-11 z-[200] rounded-2xl shadow-2xl p-4 w-[220px]"
                            style={{ background: 'var(--pd-overlay)', border: '1px solid var(--pd-b5)' }}>
                            <p className="pd-chip mb-3 px-1" style={{ color: 'var(--mist)' }}>Share this item</p>
                            <div className="space-y-0.5">
                              {[{ id: 'whatsapp', label: 'WhatsApp', bg: '#25D366' }, { id: 'twitter', label: 'X (Twitter)', bg: '#000' }, { id: 'facebook', label: 'Facebook', bg: '#1877f2' }, { id: 'telegram', label: 'Telegram', bg: '#0088cc' }].map(p => (
                                <motion.button key={p.id} whileHover={{ x: 3 }} onClick={() => shareToURL(p.id)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all" style={{ color: 'var(--silver)', fontFamily: 'Jost,sans-serif' }}>
                                  <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold" style={{ background: p.bg }}>{p.label[0]}</span>
                                  {p.label}
                                </motion.button>
                              ))}
                            </div>
                            <div className="my-3" style={{ borderTop: '1px solid var(--pd-b2)' }} />
                            <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyLink}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all"
                              style={{ background: copied ? 'rgba(74,222,128,0.06)' : 'transparent', borderColor: copied ? 'rgba(74,222,128,0.2)' : 'var(--pd-b3)', color: copied ? '#4ade80' : 'var(--silver)', fontFamily: 'Jost,sans-serif' }}>
                              {copied ? <><CheckIcon className="w-3.5 h-3.5" />Copied!</> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>{copyLabel}</>}
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* SKU + keywords */}
                <div className="pd-r flex flex-wrap items-center gap-2">
                  <span className="pd-chip px-2.5 py-1 rounded-md" style={{ background: 'var(--pd-s2)', color: 'var(--mist)' }}>SKU: {sku}</span>
                  {product.keywords?.slice(0, 3).map(kw => (
                    <span key={kw} className="pd-chip px-2.5 py-1 rounded-md capitalize" style={{ background: 'rgba(201,169,110,0.08)', color: 'var(--gold)', border: '1px solid rgba(201,169,110,0.15)' }}>{kw}</span>
                  ))}
                </div>

                {/* Name */}
                <div className="pd-r">
                  <h1 className="pd-display font-light leading-tight" style={{ color: 'var(--cream)', fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.015em' }}>
                    {product.name}
                  </h1>
                </div>

                {/* Seller */}
                <div className="pd-r">
                  <span className="text-xs" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>Sold by </span>
                  <Link to="/seller/woosho-store" className="text-xs font-medium pd-link-hover" style={{ color: 'var(--gold)', fontFamily: 'Jost,sans-serif' }}>WooSho Atelier</Link>
                </div>

                {/* Rating */}
                {product.rating_stars && (
                  <div className="pd-r"><StarRating stars={product.rating_stars} count={product.rating_count} /></div>
                )}

                {/* Price */}
                <div className="pd-r flex items-baseline gap-4">
                  <span className="pd-display font-light" style={{ fontSize: 'clamp(32px,4vw,44px)', color: 'var(--cream)', letterSpacing: '-0.02em' }}>
                    {formatMoneyCents(product.price_cents)}
                  </span>
                  {origPrice && (<>
                    <span className="text-lg line-through" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>{formatMoneyCents(origPrice)}</span>
                    <span className="pd-chip px-2.5 py-1 rounded-full" style={{ background: 'rgba(244,63,94,0.1)', color: '#f87171', border: '1px solid rgba(244,63,94,0.2)' }}>
                      −{Math.round((1 - product.price_cents / origPrice) * 100)}%
                    </span>
                  </>)}
                  {lowStock && <span className="pd-chip px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}>Low Stock</span>}
                </div>

                <div className="pd-r pd-rule" />

                {/* Color */}
                <div className="pd-r">
                  <ColorSelector availableColors={availableColors} selectedColor={selectedColor} onSelect={setSelectedColor} />
                </div>

                {/* Size */}
                {availableSizes && (
                  <div className="pd-r">
                    <SizeSelector sizes={availableSizes} selectedSize={selectedSize} onSelect={setSelectedSize} />
                  </div>
                )}

                {/* ATC */}
                <div className="pd-r">
                  <AddToCartPanel productId={product.id} atcRef={atcRef} />
                </div>

                {/* Secondary actions */}
                <div className="pd-r flex flex-wrap gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setAlertOpen(true)} disabled={hasAlert}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ fontFamily: 'Jost,sans-serif', background: hasAlert ? 'rgba(74,222,128,0.06)' : 'var(--pd-s2)', border: '1px solid ' + (hasAlert ? 'rgba(74,222,128,0.2)' : 'var(--pd-b3)'), color: hasAlert ? '#4ade80' : 'var(--silver)', cursor: hasAlert ? 'default' : 'pointer' }}>
                    {hasAlert ? <><CheckIcon className="w-3 h-3" />Alert Set</> : <><BellIcon className="w-3 h-3" />Price Alert</>}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={toggleWishlist}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ fontFamily: 'Jost,sans-serif', background: wishlisted ? 'rgba(244,63,94,0.06)' : 'var(--pd-s2)', border: '1px solid ' + (wishlisted ? 'rgba(244,63,94,0.2)' : 'var(--pd-b3)'), color: wishlisted ? '#f87171' : 'var(--silver)' }}>
                    <HeartIcon filled={wishlisted} className="w-3 h-3" />
                    {wishlisted ? 'Saved' : 'Save'}
                  </motion.button>
                </div>

                {/* Reassurance */}
                <div className="pd-r flex flex-wrap gap-x-4 gap-y-1.5">
                  {['🔒 Secure checkout', '📦 Ships in 24h', '↩️ Free 30-day returns'].map(t => (
                    <span key={t} className="text-xs" style={{ color: 'var(--mist)', fontFamily: 'Jost,sans-serif' }}>{t}</span>
                  ))}
                </div>

                <div className="pd-r pd-rule" />

                {/* Tabs */}
                <div className="pd-r">
                  <ProductTabs product={product} />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREDICTIVE PAIRINGS ──────────────────────────────────────── */}
      <PredictivePairings products={predictiveProducts} isFetching={isFetchingSimilar} />

      {/* ── PRICE ALERT MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {alertOpen && <PriceAlertModal product={product} onClose={() => { setAlertOpen(false); setHasAlert(hasPriceAlert(product.id)); }} />}
      </AnimatePresence>

      {/* ── STICKY ATC BAR ───────────────────────────────────────────── */}
      {/* <StickyATCBar product={product} productId={product.id} variantId={product.variants?.[0]?.id || null} visible={atcOutOfView} /> */}
    </div>
  );
}
