import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.js";
import { Footer } from "./Footer.js";

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Inter',sans-serif]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
