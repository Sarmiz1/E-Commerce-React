import { Link } from "react-router-dom";

export default function CurationBreadcrumbs({ colors, title }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto flex max-w-screen-xl items-center gap-2 px-6 py-4 text-xs font-semibold"
      style={{ color: colors.text.tertiary }}
    >
      <Link className="transition-colors hover:underline" to="/">
        Home
      </Link>
      <span aria-hidden="true">/</span>
      <Link className="transition-colors hover:underline" to="/products">
        Products
      </Link>
      <span aria-hidden="true">/</span>
      <span style={{ color: colors.text.primary }}>{title}</span>
    </nav>
  );
}
