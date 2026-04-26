import "./App.css";
import { RouterProvider } from "react-router-dom";
import { CartProvider } from "./Context/cart/CartContext";
import { IconContext } from "react-icons";
import { ThemeProvider } from "./Context/theme/ThemeContext";
import { AuthProvider } from "./Context/auth/AuthContext";
import { ToastProvider } from "./Context/toast/ToastContext";
import router from "./Router/router";
import QueryWrapper from "./Context/QueryClient/QueryWrapper";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


export default function App() {
  return (
    <>
      <QueryWrapper>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              <ToastProvider>
                <IconContext.Provider value={{ size: "80px", color: "green" }}>
                  <RouterProvider router={router} />
                </IconContext.Provider>
                <ReactQueryDevtools />
              </ToastProvider>
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </QueryWrapper>
    </>
  );
}
