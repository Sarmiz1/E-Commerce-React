import { motion } from "framer-motion";
// import { ShoppingCart, Star, Truck, ShieldCheck, RefreshCcw } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {

  return (
    <div className="bg-gray-50 text-gray-800 scroll-smooth">

      {/* ================= NAVBAR SECTION ================= */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">ShopEase</h1>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#products" className="hover:text-blue-600 transition">
              Products
            </a>
            <a href="#features" className="hover:text-blue-600 transition">
              Features
            </a>
            <a href="#testimonials" className="hover:text-blue-600 transition">
              Reviews
            </a>
            <a href="#contact" className="hover:text-blue-600 transition">
              Contact
            </a>
          </nav>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition">
            Cart
          </button>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <div className="animate-fadeInHero">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Discover Products You'll Love
            </h2>
            <p className="mt-6 text-lg text-blue-100">
              Premium quality. Affordable prices. Delivered fast to your doorstep.
            </p>

            <div className="mt-8 flex gap-4">
              <button className="bg-white text-blue-700 px-6 py-3 rounded-2xl hover:bg-gray-100 transition">
                Shop Now
              </button>
              <button className="border border-white px-6 py-3 rounded-2xl hover:bg-white hover:text-blue-700 transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="animate-fadeInImage">
            <img
              src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db"
              alt="Hero"
              className="rounded-2xl shadow-2xl"
            />
          </div>

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

      {/* ================= PRODUCTS SECTION ================= */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">
            Trending Products
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition transform hover:scale-105 duration-300 overflow-hidden animate-fadeInProduct"
              >
                <img
                  src={`https://source.unsplash.com/random/400x300?sig=${item}`}
                  alt="Product"
                  className="w-full h-56 object-cover"
                />

                <div className="p-6">
                  <h4 className="font-semibold">Product Name</h4>
                  <p className="text-gray-500 text-sm mt-1">
                    ⭐ 4.8 Rating
                  </p>
                  <p className="mt-4 font-bold text-lg">
                    $49.99
                  </p>

                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-2xl hover:bg-blue-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL SECTION ================= */}
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
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-center animate-fadeInCTA">
        <h3 className="text-3xl font-bold">Ready to Start Shopping?</h3>
        <p className="mt-4 text-blue-100">Join thousands of happy customers today.</p>

        <button className="mt-8 bg-white text-indigo-700 px-6 py-3 rounded-2xl hover:bg-gray-100 transition">
          Get Started
        </button>
      </section>

    </div>
  );
}


