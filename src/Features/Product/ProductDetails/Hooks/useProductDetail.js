import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../../../Context/theme/ThemeContext';
import { getDominantColor, injectDynamicTheme } from '../../../../Utils/dynamicTheme';
import { loadWishlist, saveWishlist, saveReviews, loadReviews, getSeedReviews, hasPriceAlert } from '../Utils/productHelpers';

export function useProductDetail(product) {
  const productId = product?.id;
  const { isDark } = useTheme();

  const user = useMemo(() => { try { const r = localStorage.getItem('WooSho-user'); return r ? JSON.parse(r) : null; } catch { return null; } }, []);
  const [wishlisted, setWishlisted] = useState(() => loadWishlist().includes(productId));
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy Link');
  const [reviews, setReviews] = useState([]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [hasAlert, setHasAlert] = useState(() => hasPriceAlert(productId));

  useEffect(() => { if (!product) return; const s = loadReviews(product.id); setReviews(s.length > 0 ? s : getSeedReviews(product)); }, [product?.id]);

  const toggleWishlist = useCallback(() => {
    setWishlisted(p => { const nv = !p; const l = loadWishlist(); if (nv) { if (!l.includes(productId)) l.push(productId); } else { const i = l.indexOf(productId); if (i > -1) l.splice(i, 1); } saveWishlist(l); return nv; });
  }, [productId]);

  const handleShare = useCallback(async () => {
    if (navigator.share) { try { await navigator.share({ title: product?.name, text: 'Check out ' + product?.name + ' on WooSho', url: window.location.href }); return; } catch (e) { if (e?.name === 'AbortError') return; } }
    setShareOpen(p => !p);
  }, [product]);

  const handleCopyLink = useCallback(async () => {
    const url = window.location.href; let ok = false;
    if (navigator.clipboard) { try { await navigator.clipboard.writeText(url); ok = true; } catch { } }
    if (!ok) { const ta = document.createElement('textarea'); ta.value = url; Object.assign(ta.style, { position: 'fixed', top: 0, left: 0, opacity: '0' }); document.body.appendChild(ta); ta.focus(); ta.select(); try { ok = document.execCommand('copy'); } catch { } document.body.removeChild(ta); }
    if (ok) { setCopied(true); setCopyLabel('Copied!'); setTimeout(() => { setCopied(false); setCopyLabel('Copy Link'); setShareOpen(false); }, 1500); }
    else { setCopyLabel('Failed ✗'); setTimeout(() => setCopyLabel('Copy Link'), 2500); }
  }, []);

  const shareToURL = useCallback(platform => {
    const url = encodeURIComponent(window.location.href), text = encodeURIComponent('Check out ' + (product?.name || 'this product') + ' on WooSho');
    const targets = { whatsapp: 'https://wa.me/?text=' + text + '%20' + url, twitter: 'https://twitter.com/intent/tweet?text=' + text + '&url=' + url, facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url, telegram: 'https://t.me/share/url?url=' + url + '&text=' + text };
    if (targets[platform]) { const w = 600, h = 500, l = Math.max(0, (window.screen.width - w) / 2), t = Math.max(0, (window.screen.height - h) / 2); window.open(targets[platform], '_blank', 'noopener,noreferrer,width=' + w + ',height=' + h + ',left=' + l + ',top=' + t); }
    setShareOpen(false);
  }, [product]);

  useEffect(() => { if (!shareOpen) return; const h = e => { if (!e.target.closest('.pd-share-panel') && !e.target.closest('.pd-share-btn')) setShareOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [shareOpen]);

  const handleAddReview = useCallback(review => {
    setReviews(prev => { const updated = [review, ...prev]; if (product) saveReviews(product.id, updated); return updated; });
  }, [product?.id, product]);

  useEffect(() => { if (!product?.image) return; getDominantColor(product.image).then(c => injectDynamicTheme(c)); }, [product?.image]);

  return {
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
  };
}
