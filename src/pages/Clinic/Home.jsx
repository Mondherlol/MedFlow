import { motion } from "motion/react";
import { 
  Image as ImageIcon,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";

import { withAlpha } from "../../utils/colors";


// Use extracted smaller components for clarity + reuse
import InfoPill from "../../components/Clinic/ClinicLanding/InfoPill";
import ServicesSection from "../../components/Clinic/ClinicLanding/ServicesSection";
import AboutSection from "../../components/Clinic/ClinicLanding/AboutSection";
import ContactSection from "../../components/Clinic/ClinicLanding/ContactSection";
import LoginCard from "../../components/Clinic/ClinicLanding/LoginCard";
import { useClinic } from "../../context/clinicContext";
import Hero from "../../components/Clinic/ClinicLanding/Hero";
import { useEffect, useState } from "react";


export default function Home() {
  const { clinic, theme, loading } = useClinic();
  const [layoutReady, setLayoutReady] = useState(false);

  // Rajouter un tout petit chargement de 0.2 sec quand clinique recue
  useEffect(() => {
    if(!loading && clinic) {
      const timer = setTimeout(() => {
        setLayoutReady(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, clinic]);


  if (!clinic ||  !layoutReady) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col" >
    
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25"
             style={{ background: `radial-gradient(ellipse at center, ${withAlpha(theme.primary,.25)}, transparent 60%)` }} />
        <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20"
             style={{ background: `radial-gradient(ellipse at center, ${withAlpha(theme.accent,.22)}, transparent 60%)` }} />
      </div>

      {/* ===================== HERO ===================== */}
      <motion.section
        className="relative pt-20 pb-24 md:pb-28"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Hero clinic={clinic} theme={theme} />
      </motion.section>

      {/* ===================== LOGIN / PATIENT ===================== */}
      <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}>
        <LoginCard theme={theme} />
      </motion.div>

      {/* ===================== ABOUT ===================== */}
      <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}>
        <AboutSection clinic={clinic} />
      </motion.div>

      {/* ===================== SERVICES ===================== */}
      <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}>
        <ServicesSection clinic={clinic} theme={theme} />
      </motion.div>

      {/* ===================== CONTACT ===================== */}
      <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}>
        <ContactSection clinic={clinic} theme={theme} withAlpha={withAlpha} />
      </motion.div>

      {/* ===================== FOOTER ===================== */}
      <motion.footer className="pt-10 pb-8 text-white mt-4" style={{ background: `linear-gradient(135deg, ${withAlpha(theme.primary,.96)}, ${withAlpha(theme.secondary,.96)})` }} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.6 }}>
        <div className="container mx-auto px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <InfoPill icon={ShieldCheck} color="text-white" ringColor="ring-white/30">Données protégées</InfoPill>
            <InfoPill icon={HeartPulse} color="text-white" ringColor="ring-white/30">Suivi patient</InfoPill>
          </div>
          <p className="opacity-90">&copy; {new Date().getFullYear()} {clinic.name || "Votre Clinique"}. Tous droits réservés.</p>
        </div>
      </motion.footer>
    </div>
  );
}
