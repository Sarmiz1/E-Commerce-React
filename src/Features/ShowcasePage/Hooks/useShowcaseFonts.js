import { useEffect } from "react";

const FONT_LINK_ID = "showcase-fonts";

export function useShowcaseFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return undefined;

    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@500&display=swap";
    document.head.appendChild(link);

    return undefined;
  }, []);
}
