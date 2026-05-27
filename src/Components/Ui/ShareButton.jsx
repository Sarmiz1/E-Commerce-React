import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2 } from "lucide-react";

const DEFAULT_PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp", bg: "#25D366" },
  { id: "twitter", label: "X (Twitter)", bg: "#000" },
  { id: "facebook", label: "Facebook", bg: "#1877f2" },
  { id: "telegram", label: "Telegram", bg: "#0088cc" },
];

function getCurrentUrl(url) {
  if (url) return url;
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function getShareTargets({ url, text }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };
}

export default function ShareButton({
  title,
  text,
  url,
  variant = "circle",
  label = "Share",
  copiedLabel = "Link Copied!",
  panelTitle = "Share this item",
  copyText = "Copy Link",
  platforms = DEFAULT_PLATFORMS,
  className,
  iconClassName,
  panelClassName,
  buttonStyle,
  panelStyle,
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyLabel, setCopyLabel] = useState(copyText);

  const shareUrl = getCurrentUrl(url);
  const shareTitle = title || (typeof document !== "undefined" ? document.title : "WooSho");
  const shareText = text || `Check out ${shareTitle} on WooSho`;
  const isSquare = variant === "square";

  const circleInactiveStyle = {
    background: "var(--pd-s2, rgba(15,23,42,0.06))",
    border: "1px solid var(--pd-b3, rgba(148,163,184,0.35))",
    color: "var(--mist, #64748b)",
  };
  const circleActiveStyle = {
    background: "rgba(201,169,110,0.1)",
    border: "1px solid rgba(201,169,110,0.3)",
    color: "var(--gold, #c9a96e)",
  };
  const squareInactiveStyle = {
    background: "#fff",
    border: "1px solid rgb(226 232 240)",
    color: "rgb(51 65 85)",
  };
  const squareActiveStyle = {
    background: "rgb(248 250 252)",
    border: "1px solid rgb(203 213 225)",
    color: "rgb(15 23 42)",
  };
  const inactiveButtonStyle = isSquare ? squareInactiveStyle : circleInactiveStyle;
  const activeButtonStyle = isSquare ? squareActiveStyle : circleActiveStyle;
  const buttonClassName =
    className ||
    (isSquare
      ? "group relative inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      : "pd-share-btn w-9 h-9 rounded-full flex items-center justify-center transition-all");
  const shareIconClassName =
    iconClassName ||
    (isSquare
      ? "h-4 w-4 text-slate-400 transition group-hover:text-slate-600"
      : "w-3.5 h-3.5");
  const resolvedPanelClassName =
    panelClassName ||
    (isSquare
      ? "pd-share-panel absolute right-0 top-12 z-[200] rounded-2xl shadow-2xl p-4 w-[220px]"
      : "pd-share-panel absolute right-0 top-11 z-[200] rounded-2xl shadow-2xl p-4 w-[220px]");

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    setOpen((current) => !current);
  }, [shareText, shareTitle, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    let ok = false;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        ok = true;
      } catch {
        ok = false;
      }
    }

    if (!ok && typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      Object.assign(textArea.style, {
        position: "fixed",
        top: 0,
        left: 0,
        opacity: "0",
      });
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }

      document.body.removeChild(textArea);
    }

    if (ok) {
      setCopied(true);
      setCopyLabel("Copied!");
      setTimeout(() => {
        setCopied(false);
        setCopyLabel(copyText);
        setOpen(false);
      }, 1500);
      return;
    }

    setCopyLabel("Failed");
    setTimeout(() => setCopyLabel(copyText), 2500);
  }, [copyText, shareUrl]);

  const shareToPlatform = useCallback(
    (platformId) => {
      if (typeof window === "undefined") return;

      const targets = getShareTargets({ url: shareUrl, text: shareText });
      const target = targets[platformId];
      if (!target) return;

      const width = 600;
      const height = 500;
      const left = Math.max(0, (window.screen.width - width) / 2);
      const top = Math.max(0, (window.screen.height - height) / 2);

      window.open(
        target,
        "_blank",
        `noopener,noreferrer,width=${width},height=${height},left=${left},top=${top}`,
      );
      setOpen(false);
    },
    [shareText, shareUrl],
  );

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className={buttonClassName}
        style={{
          ...(!isSquare || open ? (open ? activeButtonStyle : inactiveButtonStyle) : {}),
          ...(buttonStyle || {}),
        }}
        aria-label={panelTitle}
        aria-expanded={open}
      >
        {isSquare && copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Share2 className={shareIconClassName} />
        )}
        {isSquare && <span>{copied ? copiedLabel : label}</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 6 }}
            transition={{ duration: 0.18 }}
            className={resolvedPanelClassName}
            style={{
              background: "var(--pd-overlay, rgba(255,255,255,0.98))",
              border: "1px solid var(--pd-b5, rgba(148,163,184,0.35))",
              ...(panelStyle || {}),
            }}
          >
            <p
              className="pd-chip mb-3 px-1"
              style={{ color: "var(--mist, #64748b)" }}
            >
              {panelTitle}
            </p>
            <div className="space-y-0.5">
              {platforms.map((platform) => (
                <motion.button
                  key={platform.id}
                  type="button"
                  whileHover={{ x: 3 }}
                  onClick={() => shareToPlatform(platform.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    color: "var(--silver, #94a3b8)",
                    fontFamily: "Jost,sans-serif",
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                    style={{ background: platform.bg }}
                  >
                    {platform.label[0]}
                  </span>
                  {platform.label}
                </motion.button>
              ))}
            </div>
            <div
              className="my-3"
              style={{ borderTop: "1px solid var(--pd-b2, rgba(148,163,184,0.2))" }}
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                background: copied ? "rgba(74,222,128,0.06)" : "transparent",
                borderColor: copied
                  ? "rgba(74,222,128,0.2)"
                  : "var(--pd-b3, rgba(148,163,184,0.35))",
                color: copied ? "#4ade80" : "var(--silver, #94a3b8)",
                fontFamily: "Jost,sans-serif",
              }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {copyLabel}
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
