import { motion } from "framer-motion";
import Logo from "./FixedWrapperComponents/Logo";
import DesktopNav from "./FixedWrapperComponents/DesktopNav";
import RightActions from "./FixedWrapperComponents/RightActions";

const FixedWrapper = ({
  mobileOpen,
  pillRef,
  pillStyle,
  navigate,
  isTop,
  ALL_NAV_LINKS,
  MEGA_MENU,
  openMega,
  closeMega,
  setActiveMenu,
  activeMenu,
  keepMega,
  searchTip,
  searchOpen,
  setSearchTip,
  setAccountTip,
  setSearchOpen,
  setWishlistTip,
  wishlistTip,
  openCart,
  closeCart,
  accountTip,
  cartRef,
  cartCount,
  cartBadgeKey,
  cartHover,
  setMobileOpen,
  keepCart,
  cart,
  onRemoveFromCart,
  formatMoneyCents,
  BagIcon,
  ArrowRight,
  setCartHover,
  ChevronDown,
  SearchIcon,
  HeartIcon,
  UserIcon,
  CloseIcon,
}) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 md:px-6 pointer-events-none"
      animate={mobileOpen ? { opacity: 0, y: -20, pointerEvents: "none" } : { opacity: 1, y: 0, pointerEvents: "auto" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >

      {/* Pill */}
      <div
        ref={pillRef}
        className="nb-pill pointer-events-auto w-full max-w-[1100px] rounded-full border flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 relative"
        style={pillStyle}
      >
        {/* ── LOGO ── */}
        <Logo navigate={navigate} isTop={isTop} />

        {/* ── DESKTOP NAV ── */}
        <DesktopNav
          ALL_NAV_LINKS={ALL_NAV_LINKS}
          MEGA_MENU={MEGA_MENU}
          openMega={openMega}
          closeMega={closeMega}
          navigate={navigate}
          setActiveMenu={setActiveMenu}
          isTop={isTop}
          activeMenu={activeMenu}
          keepMega={keepMega}
          ChevronDown={ChevronDown}
        />

        {/* ── RIGHT ACTIONS ── */}
        <RightActions
          setSearchTip={setSearchTip}
          setSearchOpen={setSearchOpen}
          searchOpen={searchOpen}
          isTop={isTop}
          searchTip={searchTip}
          setWishlistTip={setWishlistTip}
          wishlistTip={wishlistTip}
          setAccountTip={setAccountTip}
          accountTip={accountTip}
          openCart={openCart}
          closeCart={closeCart}
          cartRef={cartRef}
          cartCount={cartCount}
          cartBadgeKey={cartBadgeKey}
          cartHover={cartHover}
          keepCart={keepCart}
          onRemoveFromCart={onRemoveFromCart}
          formatMoneyCents={formatMoneyCents}
          BagIcon={BagIcon}
          ArrowRight={ArrowRight}
          cart={cart}
          SearchIcon={SearchIcon}
          navigate={navigate}
          setMobileOpen={setMobileOpen}
          mobileOpen={mobileOpen}
          setCartHover={setCartHover}
          HeartIcon={HeartIcon}
          UserIcon={UserIcon}
          CloseIcon={CloseIcon}
        />
      </div>
    </motion.div>
  )
}

export default FixedWrapper
