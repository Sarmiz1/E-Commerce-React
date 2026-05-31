// src/Components/Navbar.jsx
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRegisterCartIcon } from "../context/cart/CartAnimationContext";
import { useCartState } from "../Store/cartContext";
import { useTheme } from "../Store/useThemeStore";
import { formatMoneyMinor } from "../utils/formatMoneyMinor";
import { useDebounce } from "../Hooks/useDebounce";
import { ProductsAPI } from "../api/productsApi";
import { Logo } from "./Ui/Logo";
import { DesktopNav } from "./NavbarComponents/DesktopNav";
import { MobileDrawer } from "./NavbarComponents/MobileDrawer";
import { NavbarActions } from "./NavbarComponents/NavbarActions";
import { SearchPanel } from "./NavbarComponents/SearchPanel";
import {
  ALL_NAV_LINKS,
  MEGA_MENU,
  MOBILE_CATEGORIES,
  SPECIAL_OFFERS,
} from "./NavbarComponents/navbarData";
import { NAVBAR_STYLES } from "./NavbarComponents/navbarStyles";

const NAVBAR_SCROLL_ENTER = 50;
const NAVBAR_SCROLL_EXIT = 16;
const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_HISTORY_KEY = "woosho-recent-searches";

const getStoredRecentSearches = () => {
  if (typeof window === "undefined") return [];

  try {
    const searches = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
    return Array.isArray(searches) ? searches.filter(Boolean).slice(0, 8) : [];
  } catch {
    return [];
  }
};

const storeRecentSearches = (searches) => {
  try {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searches));
  } catch {
    // Search still works when storage is unavailable.
  }
};

gsap.registerPlugin(ScrollToPlugin);

export default function Navbar({ cartIconRef: externalCartIconRef }) {
  const { cart, cartCount } = useCartState();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(getStoredRecentSearches);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [megaTriggerRect, setMegaTriggerRect] = useState(null);
  const [wishlistTip, setWishlistTip] = useState(false);
  const [accountTip, setAccountTip] = useState(false);
  const [searchTip, setSearchTip] = useState(false);

  const searchRef = useRef(null);
  const cartBtnRef = useRef(null);
  const megaTimer = useRef(null);
  const searchResultsRef = useRef(null);
  const pillRef = useRef(null);
  const cartRef = externalCartIconRef || cartBtnRef;
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const trimmedSearchQuery = searchQuery.trim();
  const trimmedDebouncedSearchQuery = debouncedSearchQuery.trim();
  const {
    data: searchResults = [],
    isFetching: searchFetching,
    isError: productsError,
    refetch: retrySearch,
  } = useQuery({
    ...ProductsAPI.search(trimmedDebouncedSearchQuery, 8),
    enabled: searchOpen && Boolean(trimmedDebouncedSearchQuery),
  });
  const {
    data: searchDiscovery = { popularSearches: [], categories: [] },
  } = useQuery({
    ...ProductsAPI.getSearchDiscovery(),
    enabled: searchOpen,
  });
  const searchLoading = Boolean(
    trimmedSearchQuery &&
    (searchFetching || trimmedSearchQuery !== trimmedDebouncedSearchQuery),
  );
  const searchError = Boolean(trimmedSearchQuery && productsError && !searchFetching);

  useRegisterCartIcon(cartRef);

  const resetSearchState = useCallback(() => {
    setSearchQuery("");
    setFocusedIdx(-1);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    resetSearchState();
  }, [resetSearchState]);

  const toggleSearch = useCallback(() => {
    if (searchOpen) {
      closeSearch();
      return;
    }

    setSearchOpen(true);
    setMobileOpen(false);
    setActiveMenu(null);
  }, [closeSearch, searchOpen]);

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
    if (!searchOpen) return undefined;
    const focusTimer = setTimeout(() => searchRef.current?.focus(), 60);
    return () => clearTimeout(focusTimer);
  }, [searchOpen]);

  useEffect(() => {
    queueMicrotask(() => {
      setMobileOpen(false);
      closeSearch();
      setActiveMenu(null);
    });
  }, [closeSearch, location.pathname]);

  const navigateAndClose = useCallback(
    (href) => {
      navigate(href);
      setActiveMenu(null);
      setMobileOpen(false);
      closeSearch();
    },
    [closeSearch, navigate],
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

      setRecentSearches((prev) => {
        const next = [cleanQuery, ...prev.filter((item) => item !== cleanQuery)].slice(0, 8);
        storeRecentSearches(next);
        return next;
      });
      navigate(`/products?search=${encodeURIComponent(cleanQuery)}`);
      closeSearch();
    },
    [closeSearch, navigate],
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
        closeSearch();
      }
    },
    [closeSearch, focusedIdx, navigateAndClose, searchResults],
  );

  const updateSearchQuery = useCallback((value) => {
    setSearchQuery(value);
    setFocusedIdx(-1);
  }, []);

  const removeRecentSearch = useCallback((term) => {
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== term);
      storeRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    storeRecentSearches([]);
    setRecentSearches([]);
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
            cartBadgeKey={cartCount}
            onToggleSearch={toggleSearch}
            onSetSearchTip={setSearchTip}
            onSetWishlistTip={setWishlistTip}
            onSetAccountTip={setAccountTip}
            onSetCartHover={setCartHover}
            onNavigate={navigateAndClose}
            onToggleMobile={() => {
              setMobileOpen((open) => !open);
              closeSearch();
              setActiveMenu(null);
            }}
            formatMoney={formatMoneyMinor}
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
        popularSearches={searchDiscovery.popularSearches}
        categories={searchDiscovery.categories}
        onClose={closeSearch}
        onSubmit={handleSearch}
        onQueryChange={updateSearchQuery}
        onKeyDown={handleSearchKeyDown}
        onCommitSearch={commitSearch}
        onClearRecent={clearRecentSearches}
        onRemoveRecent={removeRecentSearch}
        onNavigate={navigateAndClose}
        onRetry={retrySearch}
        formatMoney={formatMoneyMinor}
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
