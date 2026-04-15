function BrandStrip() {
  const brands = ["ZARA", "H&M", "GUCCI", "PRADA", "VERSACE", "DIOR", "FENDI", "BALENCIAGA"];
  const doubled = [...brands, ...brands];
  return (
    <section className="py-14 bg-white border-y border-gray-100 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-8 font-medium">Trusted Brands</p>
      <div className="flex whitespace-nowrap se-marquee-rev">
        {doubled.map((b, i) => <span key={i} className="text-gray-200 font-black text-2xl md:text-3xl tracking-tight px-10 hover:text-gray-400 transition-colors duration-300 cursor-default">{b}</span>)}
      </div>
    </section>
  );
}

export default BrandStrip
