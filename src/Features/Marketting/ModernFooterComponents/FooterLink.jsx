import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FooterLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        className="woo-footer-link group relative inline-flex items-center gap-1.5
          text-sm text-gray-500 dark:text-gray-400
          hover:text-blue-600 dark:hover:text-blue-400
          transition-colors duration-200"
      >
        <span className="relative">
          {label}
          {/* Sliding underline */}
          <span className="
            absolute -bottom-px left-0 h-px w-0 bg-blue-600 dark:bg-blue-400
            transition-all duration-300 group-hover:w-full
          " />
        </span>
        <ArrowRight
          size={11}
          className="opacity-0 -translate-x-1
            group-hover:opacity-100 group-hover:translate-x-0
            transition-all duration-200"
        />
      </Link>
    </li>
  );
}
