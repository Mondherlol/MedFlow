import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext"; 
import api from "../../api/axios";
import Loader from "../../components/Loader";

export default function SuperAdminLogin() {
  const { user, loading, login, logout } = useAuth(); 
  const navigate = useNavigate();
  const [email, setEmail] = useState("superadmin@example.com");
  const [password, setPassword] = useState("string");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) {
      // Si deja co aller au dashboard
      navigate("/__superadmin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    
    logout(); // Effacer les tokens

    try {
      const response = await api.post("/api/auth/super-login/", {
        email,
        password,
      });

      if (response.status === 200) {
        // Connexion réussie, on stocke dans les cookies
        login(response.data.user, response.data.access, response.data.refresh);
        navigate("/__superadmin/dashboard", { replace: true });
      }
    } catch (error) {
      if (error.response) {
        // Erreur backend
        setErr(error.response.data.detail || "Erreur de connexion");
      } else {
        // Erreur réseau
        setErr("Erreur de connexion, veuillez réessayer.");
      }
    }
  };


  // En attendant de voir si on est deja co ou pas
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-sky-50">
      <div className="container-max py-20 grid place-items-center">
        <form onSubmit={handleLogin} className="card w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
          <h1 className="text-3xl font-semibold text-center text-slate-800">Connectez-vous</h1>

          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                placeholder="email@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {err && <p className="text-sm text-red-600 mt-3">{err}</p>} 

          <button
            disabled={loading}
            className={`w-full mt-6 py-3 cursor-pointer text-white font-semibold rounded-xl transition ${loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"}`}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
            <p className="text-sm text-center text-slate-600 mt-1">
            Vous ne savez pas ce que vous faites ici ? 
            <br/>
            On va vous ramener en <Link to="/" className="text-orange-500 hover:underline">lieu sûr</Link>.
          </p>
        </form>
        
      </div>
    </div>
  );
}
