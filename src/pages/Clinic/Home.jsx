import { useClinic } from "../../context/clinicContext";
import { tenant } from "../../tenant";


const Home = () => {
    const { clinic } = useClinic();
    if(!clinic) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <h1 className="text-3xl font-bold mb-4">Bienvenue à {clinic.name}</h1>
            <p className="text-lg">Ceci est la page d'accueil de vottre clinique.</p>
        </div>
    )

};

export default Home;