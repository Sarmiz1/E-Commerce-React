import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DesktopView from "./NavbarLandingComponents/DesktopView";
import MobileView from "./NavbarLandingComponents/MobileView";
import MarqueeStrip from "./MarqueeStrip";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCartState } from "../../../../context/cart/CartContext";




gsap.registerPlugin(ScrollTrigger); // safe to call in multiple files — GSAP deduplicates it


const NavbarLanding = ({
  scrollToSection = '',
  mobileMenuOpen = '',
  setMobileMenuOpen,
  setCartOpen,
}) => {

  const navigate = useNavigate();

  const navLinks = [
    { label: "Products", href: "#products" },
    { label: "Features", href: "#features" },
    { label: "Reviews", href: "#testimonials" },
    { label: "Contact", href: "#cta" },
    { label: "Sell on WooSho", href: "#seller" },
    { label: "Sign up", href: '/auth' }
  ];

  const { cart } = useCartState()

  console.log("Navbar: ", cart)



  const handleNavButtonClick = useCallback((link) => {
    if (link.href.startsWith("#")) {
      scrollToSection(link.href);
    } else {
      navigate(link.href);
    }
  }, [navigate, scrollToSection]);


  return (
    <header className="flex md:flex-col flex-col-reverse">

      {/* Nav — fixed on mobile (top:36px), fixed on md+ (top:0) */}
      <section className="fixed top-[36px] md:top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl shadow-sm border-b border-gray-100/80">
        {/* Left Section */}
        <DesktopView
          navLinks={navLinks}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          cart={cart}
          setCartOpen={setCartOpen}
          handleNavButtonClick={handleNavButtonClick}
        />

        <MobileView
          mobileMenuOpen={mobileMenuOpen}
          navLinks={navLinks}
          handleNavButtonClick={handleNavButtonClick}
        />

      </section>

      {/* Marquee — fixed on mobile (top:0), sticky on md+ below nav */}
      <section className="fixed md:sticky top-0 left-0 right-0 z-40 md:mt-[64px]">
        <MarqueeStrip />
      </section>

    </header>
  )
}

export default memo(NavbarLanding)



