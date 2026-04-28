import React from "react";
import { useNavigate } from "react-router-dom";

export default function DetailBreadcrumb({ product }) {
  const navigate = useNavigate();
  
  if (!product) return null;

  return (
    <nav
      className="flex items-center gap-2 mb-10 text-xs pd-rise-1"
      style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}
    >
      <button
        onClick={() => navigate("/")}
        className="pd-link-hover transition-colors"
        style={{ color: "var(--mist)" }}
      >
        Home
      </button>
      <span style={{ color: "var(--ash)" }}>·</span>
      <button
        onClick={() => navigate("/products")}
        className="pd-link-hover transition-colors"
        style={{ color: "var(--mist)" }}
      >
        Products
      </button>
      {product.keywords?.[0] && (
        <>
          <span style={{ color: "var(--ash)" }}>·</span>
          <button
            onClick={() =>
              navigate("/products?search=" + product.keywords[0])
            }
            className="pd-link-hover transition-colors capitalize"
            style={{ color: "var(--mist)" }}
          >
            {product.keywords[0]}
          </button>
        </>
      )}
      <span style={{ color: "var(--ash)" }}>·</span>
      <span className="truncate max-w-[150px]" style={{ color: "var(--platinum)" }}>
        {product.name}
      </span>
    </nav>
  );
}
