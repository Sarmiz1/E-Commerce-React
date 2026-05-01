import { motion } from "framer-motion";
import { Sparkles, Store, ShoppingBag, TrendingUp, Shield } from "lucide-react";
import StatBadge from './StatBadge';
import heroImage from "../../../assets/marketing/mktimg2.png";
import glassLogo from "../../../assets/logos/glass_logo.png";

export default function BrandPanel({ isWide }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.4, staggerChildren: 0.15, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: isWide ? "46%" : "42%",
        minHeight: "100vh",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: [
            "linear-gradient(",
            "  to top,",
            "  rgba(4, 7, 20, 0.93) 0%,",
            "  rgba(4, 7, 20, 0.80) 20%,",
            "  rgba(4, 7, 20, 0.58) 42%,",
            "  rgba(4, 7, 20, 0.30) 65%,",
            "  rgba(4, 7, 20, 0.15) 100%",
            ")",
          ].join(""),
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "linear-gradient(to right, rgba(4,7,20,0.35) 0%, transparent 55%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          opacity: 0.032,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          minHeight: "100vh",
          padding: isWide ? "52px 52px" : "44px 40px",
        }}
      >
        <motion.div variants={itemVariants}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginTop: -35,
              marginLeft: -22,
            }}
          >
            <img
              src={glassLogo}
              alt="Woosho Logo"
              style={{
                height: 95,
                objectFit: "contain",
                filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.4))"
              }}
            />
          </div>
        </motion.div>

        <div>
          <motion.div variants={itemVariants} style={{ overflow: "hidden", marginBottom: 14 }}>
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: isWide ? "clamp(36px, 3.5vw, 52px)" : "clamp(28px, 3vw, 40px)",
                fontWeight: 400,
                lineHeight: 1.07,
                letterSpacing: "-0.035em",
                color: "#ffffff",
                textShadow: "0 2px 24px rgba(0,0,0,0.6)",
                margin: 0,
              }}
            >
              Buy smarter.
              <br />
              <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.78)" }}>Sell faster.</em>
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: isWide ? 15 : 14,
              lineHeight: 1.72,
              fontWeight: 400,
              color: "rgba(255,255,255,0.68)",
              maxWidth: 340,
              marginBottom: isWide ? 36 : 28,
              textShadow: "0 1px 8px rgba(0,0,0,0.5)",
            }}
          >
            Nigeria's most trusted marketplace — millions of products,
            thousands of verified sellers, all in one place.
          </motion.p>

          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 32,
            }}
          >
            <div className="stat-badge">
              <StatBadge icon={Store} value="50k+" label="Active Sellers" />
            </div>
            <div className="stat-badge">
              <StatBadge icon={ShoppingBag} value="2M+" label="Products Listed" />
            </div>
            <div className="stat-badge">
              <StatBadge icon={TrendingUp} value="₦8B+" label="Monthly GMV" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Shield size={12} color="rgba(255,255,255,0.38)" />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.07em",
                color: "rgba(255,255,255,0.36)",
                textTransform: "uppercase",
              }}
            >
              256-bit SSL · Verified Sellers · Buyer Protection
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
