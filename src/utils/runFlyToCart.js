import gsap from "gsap";

export const runFlyToCart = (e, cartIconRef) => {
  const card = e.currentTarget.closest("[data-cart-card]")
  const img = card?.querySelector("img");

  if (!img || !cartIconRef?.current) return;

  const ir = img.getBoundingClientRect();
  const cr = cartIconRef.current.getBoundingClientRect();

  const clone = document.createElement("div");

  clone.style.cssText = `
    position:fixed;
    top:${ir.top}px;
    left:${ir.left}px;
    width:${ir.width}px;
    height:${ir.height}px;
    background-image:url('${img.src}');
    background-size:cover;
    background-position:center;
    border-radius:16px;
    z-index:9999;
    pointer-events:none;
    box-shadow:0 8px 32px rgba(79,70,229,0.3);
  `;

  document.body.appendChild(clone);

  gsap.to(clone, {
    top: cr.top + cr.height / 2 - 20,
    left: cr.left + cr.width / 2 - 20,
    width: 40,
    height: 40,
    borderRadius: "50%",
    opacity: 0,
    duration: 0.75,
    ease: "power3.in",
    onComplete: () => {
      clone.remove();

      gsap.fromTo(
        cartIconRef.current,
        { scale: 1.4 },
        { scale: 1, duration: 0.4, ease: "elastic.out(1.2,0.5)" }
      );
    }
  });
};