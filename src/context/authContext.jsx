import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api, { setAuthToken } from "../api/axios";
import Cookies from "js-cookie";


// Initialisation du contexte
const AuthContext = createContext();

// Créer un hook personnalisé pour accéder facilement à l'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};

// Fonction pour récupérer l'utilisateur à partir du token
const getUserFromToken = async () => {
  const token = Cookies.get("auth_token");
  if (!token) return null;

  try {
    // Use configured api instance and set Authorization header for the request
    setAuthToken(token);
    const response = await api.get("/api/auth/me/");

    if (response.status !== 200) return null;
    const user = response.data;
    
    return user;
  } catch (err) {
    // Si erreur reseau 
    if(err.code === 'ERR_NETWORK') {
      // Plus tard toast erreur reseau
      console.log("Erreur reseau");
      return null;
    }else {
      // Token surement invalide, on le supprime
      Cookies.remove("auth_token");
      Cookies.remove("refresh_token");
      setAuthToken(null);
    }
    return null;
    }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  // Fonction de login
  const login = async (user, token, refresh_token) => {
    try {
      // Sauvegarde le token dans les cookies (Secure, HttpOnly pour la sécurité)
      Cookies.set("auth_token", token, { secure: true, sameSite: "Strict" });
      Cookies.set("refresh_token", refresh_token, { secure: true, sameSite: "Strict" });

      // Met à jour l'état de l'utilisateur
      setUser(user);
      // Set Authorization header on our api instance
      setAuthToken(token);
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  // Fonction de logout
  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    // Si le token est valide, ajouter l'en-tête Authorization pour toutes les requêtes axios
    const token = Cookies.get("auth_token");
    if (token) {
      setAuthToken(token);
    }

    // maintenant recuper l'user 
    let mounted = true;
    getUserFromToken()
      .then((fetchedUser) => {
        if (!mounted) return;
        setUser(fetchedUser);
      })
      .catch(() => {
        // ignore errors, user will remain null
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };

  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
