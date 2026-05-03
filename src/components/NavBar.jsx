// src/components/Navbar.jsx
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRegisterCartIcon } from "../Context/cart/CartAnimationContext";
import { useCartState } from "../Context/cart/CartContext";
import { useTheme } from "../store/useThemeStore";
import { formatMoneyCents } from "../Utils/formatMoneyCents";
import { Logo } from "./Ui/Logo";
import { DesktopNav } from "./NavbarComponents/DesktopNav";
import { MobileDrawer } from "./NavbarComponents/MobileDrawer";
import { NavbarActions } from "./NavbarComponents/NavbarActions";
import { SearchPanel } from "./NavbarComponents/SearchPanel";
import {
  ALL_NAV_LINKS,
  MEGA_MENU,
  MOBILE_CATEGORIES,
  POPULAR_SEARCHES,
  SEARCH_CATEGORIES,
  SPECIAL_OFFERS,
} from "./NavbarComponents/navbarData";
import { NAVBAR_STYLES } from "./NavbarComponents/navbarStyles";

const getData = null;
const NAVBAR_SCROLL_ENTER = 50;
const NAVBAR_SCROLL_EXIT = 16;

gsap.registerPlugin(ScrollToPlugin);

export default function Navbar({ cartIconRef: externalCartIconRef }) {
  const { cart, cartCount } = useCartState();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [megaTriggerRect, setMegaTriggerRect] = useState(null);
  const [cartBadgeKey, setCartBadgeKey] = useState(0);
  const [wishlistTip, setWishlistTip] = useState(false);
  const [accountTip, setAccountTip] = useState(false);
  const [searchTip, setSearchTip] = useState(false);

  const prevCartCount = useRef(cartCount);
  const searchRef = useRef(null);
  const cartBtnRef = useRef(null);
  const megaTimer = useRef(null);
  const searchDebounce = useRef(null);
  const searchResultsRef = useRef(null);
  const pillRef = useRef(null);
  const cartRef = externalCartIconRef || cartBtnRef;

  useRegisterCartIcon(cartRef);

  useLayoutEffect(() => {
    let rafId = 0;

    const syncScrolled = () => {
      rafId = 0;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

      setScrolled((current) => {
        const next = current ? scrollY > NAVBAR_SCROLL_EXIT : scrollY > NAVBAR_SCROLL_ENTER;
        return current === next ? current : next;
      });
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(syncScrolled);
    };

    syncScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (cartCount !== prevCartCount.current) {
      setCartBadgeKey((key) => key + 1);
      prevCartCount.current = cartCount;
    }
  }, [cartCount]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const focusTimer = setTimeout(() => searchRef.current?.focus(), 60);
    return () => clearTimeout(focusTimer);
  }, [searchOpen]);

  useEffect(() => {
    if (mobileOpen) {
      setSearchOpen(false);
      setActiveMenu(null);
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) {
      setMobileOpen(false);
      setActiveMenu(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(false);
      setFocusedIdx(-1);
      return undefined;
    }

    setSearchLoading(true);
    setSearchError(false);

    searchDebounce.current = setTimeout(async () => {
      try {
        const data = await getData(`/products?search=${encodeURIComponent(query)}&limit=8`);
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setSearchResults(items.slice(0, 8));
        setSearchError(false);
      } catch {
        setSearchResults([]);
        setSearchError(true);
      } finally {
        setSearchLoading(false);
        setFocusedIdx(-1);
      }
    }, 320);

    return () => clearTimeout(searchDebounce.current);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchOpen) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(false);
      setFocusedIdx(-1);
      setSearchQuery("");
    }
  }, [searchOpen]);

  const navigateAndClose = useCallback(
    (href) => {
      navigate(href);
      setActiveMenu(null);
      setMobileOpen(false);
      setSearchOpen(false);
    },
    [navigate],
  );

  const openMega = useCallback((label, event) => {
    clearTimeout(megaTimer.current);
    if (!MEGA_MENU[label]) return;

    setActiveMenu(label);
    const button = event?.currentTarget?.querySelector("button") || event?.currentTarget;
    if (button) setMegaTriggerRect(button.getBoundingClientRect());
  }, []);

  const closeMega = useCallback(() => {
    megaTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const keepMega = useCallback(() => clearTimeout(megaTimer.current), []);

  const commitSearch = useCallback(
    (query) => {
      const cleanQuery = query?.trim();
      if (!cleanQuery) return;

      setRecentSearches((prev) => [cleanQuery, ...prev.filter((item) => item !== cleanQuery)].slice(0, 8));
      navigate(`/products?search=${encodeURIComponent(cleanQuery)}`);
      setSearchOpen(false);
    },
    [navigate],
  );

  const handleSearch = useCallback(
    (event) => {
      event?.preventDefault();
      commitSearch(searchQuery);
    },
    [commitSearch, searchQuery],
  );

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIdx((idx) => Math.min(idx + 1, searchResults.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIdx((idx) => Math.max(idx - 1, -1));
      } else if (event.key === "Enter" && focusedIdx >= 0 && searchResults[focusedIdx]) {
        event.preventDefault();
        const product = searchResults[focusedIdx];
        navigateAndClose(`/products/${product.slug || product.id}`);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
      }
    },
    [focusedIdx, navigateAndClose, searchResults],
  );

  const updateSearchQuery = useCallback((value) => {
    setSearchQuery(value);
    setFocusedIdx(-1);
  }, []);

  const removeRecentSearch = useCallback((term) => {
    setRecentSearches((prev) => prev.filter((item) => item !== term));
  }, []);

  const isTop = !scrolled;
  const pillStyle = isTop
    ? {
        background: "rgba(8,8,16,0.72)",
        boxShadow: "none",
        borderColor: "rgba(255,255,255,0.1)",
        marginTop: "10px",
      }
    : {
        background: "rgba(255,255,255,0.94)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
        borderColor: "rgba(0,0,0,0.07)",
        marginTop: "8px",
      };

  return (
    <>
      <style>{NAVBAR_STYLES}</style>

      <Motion.div
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 md:px-6 pointer-events-none"
        animate={mobileOpen ? { opacity: 0, y: -16, scale: 0.97, pointerEvents: "none" } : { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }}
        transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      >
        <div
          ref={pillRef}
          className="nb-pill pointer-events-auto w-full max-w-[1100px] rounded-full border flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 relative"
          style={pillStyle}
        >
          <button onClick={() => navigateAndClose("/")} className="flex items-center gap-2 flex-shrink-0 mr-1 group">
            <Logo pageView="home" isScrolled={scrolled} />
          </button>

          <DesktopNav
            links={ALL_NAV_LINKS}
            megaMenu={MEGA_MENU}
            activeMenu={activeMenu}
            triggerRect={megaTriggerRect}
            isTop={isTop}
            pathname={location.pathname}
            onNavigate={navigateAndClose}
            onOpenMega={openMega}
            onCloseMega={closeMega}
            onKeepMega={keepMega}
          />

          <NavbarActions
            isTop={isTop}
            searchOpen={searchOpen}
            searchTip={searchTip}
            wishlistTip={wishlistTip}
            accountTip={accountTip}
            mobileOpen={mobileOpen}
            cart={cart}
            cartCount={cartCount}
            cartRef={cartRef}
            cartHover={cartHover}
            cartBadgeKey={cartBadgeKey}
            onToggleSearch={() => setSearchOpen((open) => !open)}
            onSetSearchTip={setSearchTip}
            onSetWishlistTip={setWishlistTip}
            onSetAccountTip={setAccountTip}
            onSetCartHover={setCartHover}
            onNavigate={navigateAndClose}
            onToggleMobile={() => {
              setMobileOpen((open) => !open);
              setSearchOpen(false);
              setActiveMenu(null);
            }}
            formatMoney={formatMoneyCents}
          />
        </div>
      </Motion.div>

      <SearchPanel
        open={searchOpen}
        searchRef={searchRef}
        resultsRef={searchResultsRef}
        query={searchQuery}
        results={searchResults}
        loading={searchLoading}
        error={searchError}
        focusedIdx={focusedIdx}
        recentSearches={recentSearches}
        popularSearches={POPULAR_SEARCHES}
        categories={SEARCH_CATEGORIES}
        onClose={() => setSearchOpen(false)}
        onSubmit={handleSearch}
        onQueryChange={updateSearchQuery}
        onKeyDown={handleSearchKeyDown}
        onCommitSearch={commitSearch}
        onClearRecent={() => setRecentSearches([])}
        onRemoveRecent={removeRecentSearch}
        onNavigate={navigateAndClose}
        formatMoney={formatMoneyCents}
      />

      <MobileDrawer
        open={mobileOpen}
        isDark={isDark}
        pathname={location.pathname}
        links={ALL_NAV_LINKS}
        categories={MOBILE_CATEGORIES}
        offers={SPECIAL_OFFERS}
        onClose={() => setMobileOpen(false)}
        onNavigate={navigateAndClose}
      />
    </>
  );
}
