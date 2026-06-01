import { useEffect } from "react";

export default function PageErrorFallback({
  error,
  resetErrorBoundary,
  onRetry,
  title = "This page could not load",
  message = "Something went wrong while loading this page. Your data is safe.",
  retryLabel = "Try again",
  showHome = true,
  compact = false,
}) {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const retry = onRetry || resetErrorBoundary;

  return (
    <div
      className={`flex items-center justify-center px-5 py-10 ${
        compact ? "min-h-[280px]" : "min-h-screen"
      }`}
      role="alert"
    >
      <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
          !
        </div>
        <h1 className="text-xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {retry && (
            <button
              type="button"
              onClick={retry}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              {retryLabel}
            </button>
          )}
          {showHome && (
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Go home
            </button>
          )}
        </div>

        {import.meta.env.DEV && error?.message && (
          <details className="mt-5 rounded-xl bg-slate-50 p-3 text-left">
            <summary className="cursor-pointer text-xs font-bold text-slate-600">
              Error details
            </summary>
            <p className="mt-2 break-words text-xs text-red-700">{error.message}</p>
          </details>
        )}
      </div>
    </div>
  );
}
