import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { queryClient } from "../../queries/queryClient";

export default function QueryWrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
