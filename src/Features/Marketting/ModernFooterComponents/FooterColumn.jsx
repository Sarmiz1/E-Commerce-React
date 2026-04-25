import FooterLink from "./FooterLink";

export default function FooterColumn({ title, items }) {
  return (
    <div className="footer-col" style={{ opacity: 0 }}>
      <p className="
        text-[10px] font-black tracking-[0.18em] uppercase mb-6
        text-gray-400 dark:text-gray-500
      ">
        {title}
      </p>
      <ul className="space-y-3.5">
        {items.map((item) => (
          <FooterLink key={item.label} {...item} />
        ))}
      </ul>
    </div>
  );
}
