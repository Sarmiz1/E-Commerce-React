import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sparkles, Sun, X } from "lucide-react";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { Logo } from "../../../Components/Ui/Logo";

const DEFAULT_CTA = { label: "AI Shop", href: "/ai-shop" };

export default function MarketingNavbar({
  navLinks = [],
  cta = DEFAULT_CTA,
  pageView = "marketing",
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const isSellerHeroSurface = pageView === "sell" && !isScrolled;
  const logoNeedsDarkSurfaceAsset = isSellerHeroSurface || isDark;
  const desktopLinkClass = isSellerHeroSurface
    ? "text-sm font-bold text-white/80 transition hover:text-white"
    : "text-sm font-bold text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400";
  const mobileLinkClass = isSellerHeroSurface
    ? "rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-100 transition hover:bg-white/10"
    : "rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10";
  const themeButtonClass = isSellerHeroSurface
    ? "border-white/15 text-white/85 hover:border-white/30 hover:bg-white/10 hover:text-white"
    : "border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white";

  const scrollToHash = (href, event) => {
    event?.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (!target) {
      window.location.hash = href;
      return;
    }

    window.history.replaceState(null, "", href);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAction = (href) => {
    if (href.startsWith("#")) {
      scrollToHash(href);
      return;
    }

    setMobileOpen(false);
    navigate(href);
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("/");
  };

  const renderLink = (link, className) => {
    if (link.href.startsWith("#")) {
      return (
        <button
          className={className}
          key={link.href}
          onClick={(event) => scrollToHash(link.href, event)}
          type="button"
        >
          {link.label}
        </button>
      );
    }

    return (
      <Link className={className} key={link.href} to={link.href}>
        {link.label}
      </Link>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[9000] px-4 py-3 md:px-6">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-xl transition ${
          isSellerHeroSurface
            ? "border-white/10 bg-black/35 text-white"
            : "border-black/5 bg-white/90 text-slate-950 dark:border-white/10 dark:bg-[#0E0E10]/90 dark:text-white"
        }`}
      >
        <button
          aria-label={location.pathname === "/" ? "Back to top" : "Go to home"}
          className="shrink-0"
          onClick={handleLogoClick}
          type="button"
        >
          <Logo
            isDark={logoNeedsDarkSurfaceAsset}
            isScrolled
            pageView={pageView === "sell" ? "sell" : "home"}
          />
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => renderLink(link, desktopLinkClass))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${themeButtonClass}`}
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            type="button"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
            onClick={() => handleAction(cta.href)}
            type="button"
          >
            {cta.label}
            <Sparkles className="h-4 w-4" />
          </button>
        </div>

        <button
          aria-label="Toggle menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden dark:border-white/10 dark:text-white"
          onClick={() => setMobileOpen((value) => !value)}
          type="button"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-2xl border border-black/5 bg-white/95 p-4 shadow-xl backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-[#0E0E10]/95">
          <div className="grid gap-2">
            {navLinks.map((link) => renderLink(link, mobileLinkClass))}
            <button
              className={`inline-flex h-12 items-center justify-between rounded-xl border px-3 text-sm font-black transition ${themeButtonClass}`}
              onClick={toggle}
              type="button"
            >
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
              onClick={() => handleAction(cta.href)}
              type="button"
            >
              {cta.label}
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
