import { motion, AnimatePresence } from "framer-motion";
import Footer from "./MobileDrawerCoponents/Footer";
import MainLinks from "./MobileDrawerCoponents/MainLinks";
import Header from "./MobileDrawerCoponents/Header";


const MobileDrawer = ({
  mobileOpen,
  setMobileOpen,
  ALL_NAV_LINKS,
  location,
  navigate,
  CloseIcon,
  UserIcon,
  HeartIcon,
  BagIcon,
  ArrowRight,
}) => {
  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[97] bg-black/45 lg:hidden" style={{ backdropFilter: "blur(4px)" }}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[98] lg:hidden flex flex-col"
            style={{ width: "min(360px, 88vw)", background: "rgba(255,255,255,0.99)", backdropFilter: "blur(32px)", boxShadow: "-8px 0 60px rgba(0,0,0,0.2)" }}
          >
            {/* Drawer header */}
            <Header setMobileOpen={setMobileOpen}  CloseIcon={CloseIcon}/>


            {/* Main links */}
            <MainLinks
              ALL_NAV_LINKS={ALL_NAV_LINKS}
              location={location}
              navigate={navigate}
              setMobileOpen={setMobileOpen}
              UserIcon={UserIcon}
              HeartIcon={HeartIcon}
              BagIcon={BagIcon}
              ArrowRight={ArrowRight }
            />

            {/* Drawer footer */}
            <Footer navigate={navigate} setMobileOpen={setMobileOpen} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileDrawer
