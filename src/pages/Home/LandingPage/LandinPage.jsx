import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { useNavigate, useLoaderData } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function LandingPage() {

  const [showTopBtn, setShowTopBtn] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const cartIconRef = useRef(null);

  // Products Data
    const products = useLoaderData();

  // Trending Products
  const trendingProducts = products?.slice(0, 6) || [];

  // Add to Cart  Function
  const addToCart = (product, e) => {
    if (!product) return;

    const img = e.currentTarget.closest(".product-card")?.querySelector("img");
    if (img && cartIconRef.current) {
      const imgRect = img.getBoundingClientRect();
      const cartRect = cartIconRef.current.getBoundingClientRect();

      const clone = img.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.top = imgRect.top + "px";
      clone.style.left = imgRect.left + "px";
      clone.style.width = imgRect.width + "px";
      clone.style.zIndex = 9999;
      document.body.appendChild(clone);

      gsap.to(clone, {
        top: cartRect.top,
        left: cartRect.left,
        width: 40,
        height: 40,
        opacity: 0.5,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => clone.remove(),
      });
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + amount) }
            : item
        )
    );
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );

  // Rendering Stars Rating function
  const renderStars = (rating = 0) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array(full)
          .fill()
          .map((_, i) => (
            <span key={`f-${i}`} className="text-yellow-500">★</span>
          ))}
        {half && <span className="text-yellow-500">⯪</span>}
        {Array(empty)
          .fill()
          .map((_, i) => (
            <span key={`e-${i}`} className="text-gray-300">★</span>
          ))}
        <span className="ml-2 text-sm text-gray-500">{rating}</span>
      </div>
    );
  };

  // Scroll to section Logic
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id) => {
    gsap.to(window, {
      duration: 1,
      scrollTo: id,
      ease: "power2.inOut",
    });
  };


  // Back To Top Button Logic
  // Button color
  const topButtonColor = "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-indigo-500/40"

  // Adiffrent Logic for the To top Button
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const scrollTop = window.scrollY;
  //     const docHeight =
  //       document.documentElement.scrollHeight - window.innerHeight;

  //     const progress = docHeight > 0 ? scrollTop / docHeight : 0;

  //     setScrollProgress(progress);

  //     if (scrollTop > 400) {
  //       setShowTopBtn(true);
  //     } else {
  //       setShowTopBtn(false);
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      // Prevent divide-by-zero
      const progress =
        docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

      setScrollProgress(progress);
      setShowTopBtn(scrollTop > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Run once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: 0 },
      ease: "power2.inOut",
    });
  };


  return (
    <div ref={pageRef} className="bg-gray-50 text-gray-800">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ShopEase</h1>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <button onClick={() => scrollToSection("#products")}>Products</button>
            <button onClick={() => scrollToSection("#features")}>Features</button>
            <button onClick={() => scrollToSection("#testimonials")}>Reviews</button>
            <button onClick={() => scrollToSection("#cta")}>Contact</button>
          </nav>

          <button
            ref={cartIconRef}
            onClick={() => setCartOpen(true)}
            className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl"
          >
            Cart
            {cart.length > 0 && (
              <motion.span
                key={cart.length}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full"
              >
                {cart.length}
              </motion.span>
            )}
          </button>

          <button className="flex md:hidden items-center gap-1 text-sm font-medium" onClick={() => alert("Mobile menu coming soon!")}>
            Menu
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 text-center reveal">
        <h2 className="text-5xl font-extrabold">
          Discover Products You'll Love
        </h2>
        <p className="mt-6 text-lg text-blue-100">
          Premium quality. Delivered fast.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="mt-8 bg-white text-indigo-700 px-8 py-3 rounded-xl font-semibold 
              hover:scale-105 hover:bg-gray-100 transition-transform duration-300"
        >
          Shop Now
        </button>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-20 max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-12 reveal">
          Trending Products
        </h3>

        {/* {isLoading && (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3,4,5].map(i => (
              <div key={i} className="h-72 bg-gray-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        )} 
        MIGHT NEED THIS FOR UI SKELETON 
         */}

        <div className="grid md:grid-cols-3 gap-8">
          {trendingProducts.map((item) => (
            <motion.div
              whileHover={{ y: -10 }}
              key={item.id}
              className="product-card bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden reveal"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h4 className="font-semibold text-lg">{item.name}</h4>
                {renderStars(item.rating?.stars || 0)}
                <p className="my-4 font-bold text-xl ">
                  {formatMoneyCents(item.priceCents)}
                </p>
                <button
                  onClick={(e) => addToCart(item, e)}
                  className="w-full mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-12">
            Why Shop With Us?
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fast Delivery",
                desc: "Get your orders delivered quickly and safely.",
              },
              {
                title: "Secure Payments",
                desc: "Your transactions are encrypted and secure.",
              },
              {
                title: "Easy Returns",
                desc: "Hassle-free returns within 30 days.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 duration-300 animate-fadeInFeature"
              >
                <h4 className="font-semibold text-lg mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-12">
            What Our Customers Say
          </h3>

          <div className="bg-gray-100 p-10 rounded-2xl shadow-md animate-fadeInTestimonial">
            <p className="text-lg italic">
              “Absolutely amazing service and quality products. I’ll definitely shop again!”
            </p>
            <p className="mt-4 font-semibold">— Happy Customer</p>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-center animate-fadeInCTA" id="cta">
        <h3 className="text-3xl font-bold">Ready to Start Shopping?</h3>
        <p className="mt-4 text-blue-100">Join thousands of happy customers today.</p>

        <button className="mt-8 bg-white text-indigo-700 px-6 py-3 rounded-2xl hover:bg-gray-100 transition">
          Get Started
        </button>
      </section>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-6">Your Cart</h3>

            {cart.length === 0 && <p>Cart is empty</p>}

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between mb-6">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatMoneyCents(item.priceCents)}
                  </p>
                  <div className="flex gap-3 mt-2 items-center">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-8 font-bold text-lg">
              Total: {formatMoneyCents(totalPrice)}
            </div>

            <button
              onClick={() => setCartOpen(false)}
              className="mt-6 w-full bg-black text-white py-3 rounded-xl"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* To the Top Button */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-50 
            w-14 h-14 
            rounded-full 
            ${topButtonColor}
            text-white 
            shadow-xl 
            flex items-center justify-center 
            transition-all duration-300 
            hover:scale-110`}
          >
            {/* Progress Ring */}
            <svg className="absolute w-16 h-16 rotate-[-90deg]">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="white"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={
                  2 * Math.PI * 28 * (1 - scrollProgress)
                }
                strokeLinecap="round"
              />
            </svg>

            <span className="relative text-white font-bold text-lg">
              ↑
            </span>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}








{/* <AnimatePresence>
  {showTopBtn && (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 40 }}
      transition={{ duration: 0.3 }}
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full
      bg-indigo-600 text-white shadow-xl
      flex items-center justify-center hover:scale-110 transition"
      style={{
        background: `conic-gradient(
          #4f46e5 ${scrollProgress * 360}deg,
          #e5e7eb ${scrollProgress * 360}deg
        )`
      }}
    >
      <div className="bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center text-white">
        ↑
      </div>
    </motion.button>
  )}
</AnimatePresence> 


A DIFFRENT DESIGN FOR TO TOP BUTTON
*/}