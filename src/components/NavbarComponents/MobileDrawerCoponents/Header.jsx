import React from "react";

const Header = ({ setMobileOpen, CloseIcon }) => {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white" />
        </div>
        <span
          className="font-black text-gray-900 text-base"
          style={{ fontFamily: "'Georgia','Palatino Linotype',serif" }}
        >
          Woo<span className="text-indigo-600">Sho</span>
        </span>
      </div>
      <button
        onClick={() => setMobileOpen(false)}
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer"
      >
        <CloseIcon className="w-4 h-4 text-gray-500 " />
      </button>
    </div>
  );
};

export default Header;
