import { Routes, Route, Navigate } from "react-router-dom";
import { tenant } from "./tenant";

// Super Admin pages
import SuperAdminLogin from "./pages/SuperAdmin/Login";
import Dashboard from "./pages/SuperAdmin/Dashboard";
import ClinicRequest from "./pages/SuperAdmin/ClinicRequest";
import ClinicInfos from "./pages/SuperAdmin/ClinicInfos";

// Clinic pages
import Home from "./pages/Clinic/Home";

// Other pages
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Components
import Navbar from "./components/Navbar/Navbar";
import SuperAdminNavbar from "./components/Navbar/SuperAdminNavbar";
import Footer from "./components/Footer/Footer";
import { useAuth } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ClinicRoute from "./components/ClinicRoute";
import { Toaster } from "react-hot-toast";
import { useClinic } from "./context/clinicContext";

export default function App() {
  const onRoot = !tenant; // root domain or localhost
  const { user, loading: authLoading } = useAuth();

  return (
    <>
      <Toaster />
      { user && !authLoading && !clinicLoading && user.role === "SUPER_ADMIN" ?
        <SuperAdminNavbar /> :
        <Navbar />  
      }
      <Routes>

      <Route path="*" element={<NotFound />} />

      {/* Super Admin routes */}
        <Route path="/__superadmin/login" element={<SuperAdminLogin />} />
        <Route
          path="/__superadmin/dashboard"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="/__superadmin/clinic-request/:id" 
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <ClinicRequest />
            </ProtectedRoute>
          } 
        />

        <Route path="/__superadmin/clinic-infos/:id" 
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <ClinicInfos />
            </ProtectedRoute>
          } 
        />

        <Route path="/__superadmin/*" element={<Navigate to="/__superadmin/login" replace />} />
      
      {onRoot ? (
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
   
        </>
      ) : (
        // Routes pour les cliniques en sous-domaine 
              <>
                <Route path="/" element={
                  <ClinicRoute>
                    <Home/>
                  </ClinicRoute>
                } />
              </>
      )}
      </Routes>
      <Footer />
    </>
  );
}
