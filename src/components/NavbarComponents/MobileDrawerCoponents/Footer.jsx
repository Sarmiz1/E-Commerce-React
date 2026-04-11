import React from 'react'

const Footer = ({ navigate, setMobileOpen }) => {
  return (
    <div className="px-4 py-5 border-t border-gray-100 bg-gray-50/50">
      <button onClick={() => { navigate("/products"); setMobileOpen(false); }}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-indigo-500/30">
        Shop All Products →
      </button>
      <p className="text-center text-gray-400 text-[11px] mt-2.5">🚀 Free shipping on orders over $50</p>
    </div>
  )
}

export default Footer
