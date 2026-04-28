import React from "react";
import { ColorSelector } from "./ColorSelector";
import { SizeSelector } from "./SizeSelector";

export default function DetailInventory({ 
  availableColors, 
  selectedColor, 
  setSelectedColor, 
  hasSizes, 
  availableSystems, 
  sizeSystem, 
  setSizeSystem, 
  availableSizes, 
  selectedSize, 
  setSelectedSize, 
  productType 
}) {
  return (
    <div className="space-y-6">
      {/* Color */}
      <div className="pd-r">
        <ColorSelector
          availableColors={availableColors}
          selectedColor={selectedColor}
          onSelect={setSelectedColor}
        />
      </div>

      {/* Size */}
      {hasSizes && (
        <div className="pd-r">
          <div className="flex items-center gap-2 mb-3">
            {availableSystems.map(sys => (
              <button
                key={sys}
                onClick={() => setSizeSystem(sys)}
                className="text-[9px] uppercase tracking-widest px-2 py-1 rounded border transition-all"
                style={{
                  background: sizeSystem === sys ? "var(--gold)" : "transparent",
                  color: sizeSystem === sys ? "var(--obsidian)" : "var(--silver)",
                  borderColor: sizeSystem === sys ? "var(--gold)" : "var(--pd-b3)"
                }}
              >
                {sys}
              </button>
            ))}
          </div>
          <SizeSelector
            sizes={availableSizes}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
            productType={productType}
          />
        </div>
      )}
    </div>
  );
}
