// src/Pages/NotFoundPage.jsx
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen flex flex-col justify-center items-center text-center p-20 gap-6 bg-[rgba(245,245,245,0.95)] dark:bg-[rgba(18,18,18,0.95)] text-[#111] dark:text-[#fff]" 
    >
      <img
        component="img"
        src="public/images/notFound/notfound-removebg-preview.png"
        alt="Page not found"
        className="w-40 sm:w-44 md:w-52 rounded-md shadow-lg"
      />

      <h3
        variant="h3"
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl"
      >
        404 - Page Not Found
      </h3>

      <p
        variant="body1"
        className="text-sm sm:text-base md:text-lg"
      >
        The page you are looking for does not exist.
      </p>

      <button
        onClick={() => navigate("/")}
        className="p-2 bg-sky-400 rounded-md text-slate-900 dark:text-slate-200 hover:animate-pulse"
      >
        Go Home
      </button>
    </div>
  );
}