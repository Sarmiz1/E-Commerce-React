import { useEffect } from "react";

function WidgetFallbackPage({ 
  title = "Something went wrong", 
  message = "Please try again.", 
  retryLabel = "Retry", 
  showReload = true, 
  error, 
  resetErrorBoundary,
  gridPosition = 'n/a'
}) {
  // Optional: log error
  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  return (
    <div className={`flex justify-center items-center min-h-[200px] bg-gray-50 p-6 rounded-lg shadow-md ${gridPosition}`}>
      <div className="text-center">
        <h2 className="text-red-600 text-xl font-bold mb-2">⚠️ {title}</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-center gap-3">
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="bg-greenPry text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              {retryLabel}
            </button>
          )}
          {showReload && (
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WidgetFallbackPage