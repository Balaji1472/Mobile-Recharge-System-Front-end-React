import React, { useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "./index.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Toast from "./features/toast/components/jsx/Toast";
import AppRoutes from "./routes/AppRoutes";

function AppShell() {
  const location = useLocation();
  const isAdmin    = location.pathname.startsWith("/admin");
  const isUser     = location.pathname.startsWith("/user");
  const isRecharge = location.pathname.startsWith("/recharge");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [is404, setIs404] = useState(false);        

  const isDashboard      = isAdmin || isUser;
  const shouldShowFooter = !isDashboard && !isRecharge;

  return (
    <>
      {!is404 && (                                  
        <Navbar
          onSidebarToggle={() => setSidebarOpen((o) => !o)}
          sidebarOpen={sidebarOpen}
        />
      )}
      <AppRoutes
        sidebarOpen={sidebarOpen}
        onSidebarClose={(val) => setSidebarOpen(val ?? false)}
        onNotFound={setIs404}                       
      />
      {shouldShowFooter && !is404 && <Footer />}    
      <Toast />
      {isDashboard && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </Provider>
  );
}