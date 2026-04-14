import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LeftSection from "./NavbarLandingComponents/LeftSection";
import RightSection from "./NavbarLandingComponents/RightSection";
import MarqueeStrip from "./MarqueeStrip";
import { useContext, memo } from "react";
// import { CartStateContext } from "../../../../Context/cartContext222"; 
import { useCartState } from "../../../../Context/cart/CartContext";




gsap.registerPlugin(ScrollTrigger); // safe to call in multiple files — GSAP deduplicates it


const NavbarLanding = ({
  scrollToSection = '',
  mobileMenuOpen = '',
  setMobileMenuOpen ,
  setCartOpen,
  cartIconRef,
}) => {

  const navLinks = [{ label: "Products", href: "#products" }, { label: "Features", href: "#features" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#cta" }];

  const { cart } = useCartState()
  
  console.log("Navbar: ", cart)


  return (
    <header className="flex md:flex-col flex-col-reverse">

      {/* Nav — fixed on mobile (top:36px), fixed on md+ (top:0) */}
      <section className="fixed top-[36px] md:top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl shadow-sm border-b border-gray-100/80">
        {/* Left Section */}
        <LeftSection
          navLinks={navLinks}
          scrollToSection={scrollToSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          cart={cart}
          setCartOpen={setCartOpen}
          cartIconRef={cartIconRef}
        />

        <RightSection
          mobileMenuOpen={mobileMenuOpen}
          navLinks={navLinks}
          scrollToSection={scrollToSection}
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



