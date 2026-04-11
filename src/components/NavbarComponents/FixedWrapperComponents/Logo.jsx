import React from 'react'

const Logo = ({navigate, isTop}) => {
  return (
    <button onClick={() => navigate("/")}
      className="flex items-center gap-2 flex-shrink-0 mr-1 group">
      {/* Logomark */}
      <div className="relative w-8 h-8 flex-shrink-0">
        <div className={`absolute inset-0 rounded-full transition-all duration-400 ${isTop ? "bg-gradient-to-br from-blue-400 to-violet-500" : "bg-gradient-to-br from-blue-600 to-indigo-600"}`} />
        <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-400 ${isTop ? "bg-gradient-to-br from-blue-400 to-violet-500" : "bg-gradient-to-br from-blue-600 to-indigo-600"}`} />
        </div>
      </div>
      <span className="font-black text-[1.05rem] tracking-tight leading-none hidden sm:block transition-colors duration-300"
        style={{ fontFamily: "'Georgia','Palatino Linotype',serif", color: isTop ? "#fff" : "#111827" }}>
        Woo<span style={{ color: isTop ? "#a5b4fc" : "#4f46e5" }}>Sho</span>
      </span>
    </button>
  )
}

export default Logo
