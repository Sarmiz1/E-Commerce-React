import React from 'react'

const BottomBar = () => {

  const PAYMENT_ICONS = ["VISA", "MC", "AMEX", "PayPal", "Apple Pay", "GPay"];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <p className="text-gray-700 text-xs tracking-widest uppercase">
            © {new Date().getFullYear()} WooSho Inc.
          </p>
          <span className="hidden md:block text-gray-800">·</span>
          <p className="text-gray-800 text-xs tracking-wide">All rights reserved.</p>
        </div>

        {/* Payment methods */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-gray-700 text-[10px] tracking-widest uppercase mr-1">We accept</span>
          {PAYMENT_ICONS.map((p) => (
            <span key={p} className="payment-chip">{p}</span>
          ))}
        </div>

        {/* Tagline */}
        <p className="text-gray-800 text-[10px] tracking-[0.25em] uppercase hidden lg:block">
          Crafted for the discerning ✦
        </p>
      </div>
    </div>
  )
}

export default BottomBar
