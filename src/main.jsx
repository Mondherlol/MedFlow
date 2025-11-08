import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/authContext.jsx";
import ScrollToTop from "./components/ScrollToTop";
import { ClinicProvider } from "./context/clinicContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
          <ScrollToTop />
        <AuthProvider>
        <ClinicProvider>
          <App />
        </ClinicProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
