// Animated floating orbs for footer
function FooterOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] bg-amber-400 -top-40 -left-40 footer-orb-1" />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.05] bg-blue-500 top-20 right-0 footer-orb-2" />
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.06] bg-amber-300 bottom-0 left-1/2 footer-orb-3" />
    </div>
  );
}

export default FooterOrbs
