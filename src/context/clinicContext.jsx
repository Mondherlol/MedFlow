import { createContext, useContext, useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { tenant } from "../tenant";


// Initialisation du contexte
const ClinicContext = createContext();

// Créer un hook personnalisé pour accéder facilement à la clinique
export const useClinic = () => {
  return useContext(ClinicContext);
};


const getClinicFromTenant = async (tenant) => {
  if (!tenant) return null;
    try {
        const response = await api.get(`/api/clinics/by-slug/?slug=${tenant}`);
        if (response.status !== 200) return null;
        const clinic = response.data;
        return clinic;
    }
    catch (err) {
        console.log("Erreur lors de la récupération de la clinique:", err);
        return null;
    }
};

export const ClinicProvider = ({ children }) => {
  const [clinic, setClinic] = useState();
  const [loading, setLoading] = useState(true);

  const theme = useMemo(() => ({
        primary: clinic?.primary_color || "#3b82f6",
        secondary: clinic?.secondary_color || "#1e40af",
        accent: clinic?.accent_color || "#f59e0b",
  }), [clinic]);

  useEffect(() => {
    // maintenant recuperer la clinique
    let mounted = true;
    getClinicFromTenant(tenant)
      .then((fetchedClinic) => {
        setClinic(fetchedClinic);
      })
        .catch(() => {
        // ignore errors, clinic will remain null
      })
        .finally(() => {
          setLoading(false);
        });
    return () => {
      mounted = false;
    };

  }, []);

  return (
    <ClinicContext.Provider value={{ clinic, setClinic, loading, theme }}>
      {children}
    </ClinicContext.Provider>
  );
};
