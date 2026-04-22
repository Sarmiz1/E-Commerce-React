# Woosho E-Commerce Ecosystem

Welcome to the **Woosho E-Commerce Platform**, a cutting-edge, high-performance, and fully responsive e-commerce web application built with modern web technologies. Woosho is designed to deliver a premium shopping experience featuring AI-powered assistants, dynamic user dashboards, real-time backend integration, and a highly modular architecture.

## 🚀 Key Features

### 1. **Premium User Experience (UX) & Interface (UI)**
- **Fluid Animations**: Utilizing `framer-motion` and `gsap` for silky-smooth page transitions, micro-interactions, and complex visual choreography.
- **Dynamic Theming**: Built-in Context API handles global light and dark mode toggling instantly across the entire application.
- **Custom Global Toast System**: A robust, zero-dependency floating notification system for seamless feedback on user actions (success, error, info).
- **Responsive Architecture**: Fully responsive across mobile, tablet, and desktop displays, with responsive navigations and custom bottom-navigation bars for mobile users.

### 2. **AI Shopping Assistant (Woosho AI)**
- **Global Floating AI Widget**: A persistent AI assistant widget available globally across the site, enabling conversational product discovery.
- **Buyer Dashboard AI Integration**: A dedicated AI panel inside the Buyer Dashboard that remembers user preferences, sizes, and past purchases to provide curated real-time recommendations.
- **Atomic Chat Architecture**: AI components are modularized down to individual chat bubbles, typing indicators, and product carousel cards.

### 3. **Role-Based Dashboards**
- **Buyer Dashboard**: Centralized hub for users to track orders, manage wishlists, update addresses, and view personal shopping analytics.
- **Seller Dashboard**: A comprehensive interface for merchants to manage product listings, view sales charts, approve reviews, and track revenue.
- **Admin Dashboard**: The "Control Room" for the platform. Oversees user metrics, ecosystem health, global inventory, and system logs.

### 4. **Live Backend Integration**
- **Supabase Authentication**: Full live integration with Supabase for secure user sign-ups, logins, and password resets.
- **Database Connectivity**: Operations (wishlists, orders, cart) are routed through asynchronous actions using Supabase's real-time PostgreSQL database.

### 5. **Robust State Management**
- **React Context API**: Heavy utilization of Context (`AuthContext`, `ThemeContext`, `ToastContext`, `BuyerContext`) to ensure state is synchronized globally without prop drilling.
- **Custom Hooks**: Business logic is decoupled from UI components using custom hooks (e.g., `useBuyerData`, `useSellerData`, `useWooshoChat`), resulting in clean, readable, and highly maintainable components.

## 🛠 Tech Stack

- **Frontend Framework**: React 19 + Vite
- **Styling**: Vanilla CSS, Inline Styles (for dynamic theming), and modular utility classes
- **Animation**: Framer Motion, GSAP
- **Icons**: Lucide React, Custom SVG Icons (`BIcon`)
- **Backend & Auth**: Supabase (PostgreSQL, Supabase Auth)
- **Routing**: React Router DOM (v7)

## 🏗 Architecture & Philosophy

The project follows an **Atomic Design Philosophy**. Instead of monolithic page files, features are broken down into:
- **Pages**: High-level orchestrators (e.g., `AuthPage`, `WooshoAi`).
- **Context/Hooks**: Global state and business logic extraction.
- **Components**: Reusable, pure functional UI elements (e.g., `MessageBubble`, `ProductCard`, `CartPanel`).

Every file contains detailed comments explaining the flow of logic, making it exceptionally developer-friendly and scalable for future upgrades.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Sarmiz1/E-Commerce-React.git
   ```
2. Navigate to the project directory:
   ```bash
   cd E-Commerce-React
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Application
To start the development server with Fast Refresh:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

## 🤝 Contributing
As an atomic project, ensure that any new feature is broken down into small, reusable components. Keep state logic in custom hooks and UI rendering in functional components. Always document your code extensively for the next developer.
