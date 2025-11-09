import React, { useState } from "react";
import SignUpChoice from "../../components/Clinic/SignUp/SignUpChoice";
import SignUpPatient from "../../components/Clinic/SignUp/SignUpPatient";
import { useClinic } from "../../context/clinicContext";

export default function SignUpPage() {
  const { clinic, theme } = useClinic();
  const [mode, setMode] = useState(null); // null | 'patient'

  // step 0 : choose profile (pro vs patient)
  if (!mode) {
    return <SignUpChoice clinic={clinic} theme={theme} onSelect={(m) => setMode(m)} />;
  }

  // patient flow
  return <SignUpPatient />;
}
