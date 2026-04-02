import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LeftSection from "./NavBarComponents/LeftSection";
import RightSection from "./NavBarComponents/RightSection";
import MarqueeStrip from "./MarqueeStrip";



gsap.registerPlugin(ScrollTrigger); // safe to call in multiple files — GSAP deduplicates it


const NavBar = ({
  navLinks,
  scrollToSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  cart,
  navigate,
  setCartOpen,
  cartIconRef,
}) => {
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
          navigate={navigate}
        />

      </section>

      {/* Marquee — fixed on mobile (top:0), sticky on md+ below nav */}
      <section className="fixed md:sticky top-0 left-0 right-0 z-40 md:mt-[64px]">
        <MarqueeStrip />
      </section>
    </header>
  )
}

export default NavBar



