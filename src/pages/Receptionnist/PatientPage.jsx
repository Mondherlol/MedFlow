import { useEffect, useState } from "react";
import { useClinic } from "../../context/clinicContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

function PatientPage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [params] = useSearchParams();
    const {clinic} = useClinic();
    const navigate = useNavigate();
    const patientId = params.get("id");

    const fetchPatient = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/clinics/${clinic?.id}/patients/${patientId}`);
            setPatient(response.data);
        } catch (error) {
            console.error("Error fetching patient data:", error);
            toast.error("Erreur lors du chargement des données du patient");
        } finally {
            setLoading(false);
        }   
    };

    useEffect(() => {
        console.log("Patient ID from params:", patientId);
        if (patientId) {
            fetchPatient();
        }
    }, [patientId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if(!patient) {
        return <div>Patient not found</div>;
    }


  return <div>PatientPage</div>;
}
export default PatientPage;