import { useEffect } from "react";
import { useErrorBoundary } from "react-error-boundary";

const useShowErrorBoundary = (error) => {
  const { showBoundary } = useErrorBoundary();

  useEffect(() => {
    if (error) {
      showBoundary(
        error instanceof Error ? error : new Error(error)
      );
    }
  }, [error, showBoundary]);
};

export default useShowErrorBoundary;