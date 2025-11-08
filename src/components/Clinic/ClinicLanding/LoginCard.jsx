import React from "react";
import Card from "./Card";
import InfoPill from "./InfoPill";
import CTAButton from "./CTAButton";
import { ShieldCheck, Star, CalendarCheck, Stethoscope, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginCard({ theme }) {
  const navigate = useNavigate();
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-5xl mx-auto overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Bandeau gauche */}
            <div className="p-8 text-white relative" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
              <div className="absolute inset-0 opacity-15" aria-hidden style={{ background: `radial-gradient(ellipse at 20% 10%, white 0%, transparent 40%)` }} />
              <h3 className="text-2xl font-bold mb-3">Espace patient</h3>
              <p className="text-white/90 mb-6">Gérez vos rendez-vous, consultez vos résultats et échangez avec votre médecin en toute sécurité.</p>
              <div className="grid gap-3">
                <InfoPill icon={CalendarCheck} color="text-white" ringColor="ring-white/20">Gestion des rendez-vous</InfoPill>
                <InfoPill icon={Stethoscope} color="text-white" ringColor="ring-white/20">Résultats en ligne</InfoPill>
                <InfoPill icon={Mail} color="text-white" ringColor="ring-white/20">Messagerie sécurisée</InfoPill>
              </div>
            </div>

            {/* Actions droite */}
            <div className="p-8">
              <h4 className="text-lg font-semibold text-center mb-6">Accédez à votre compte</h4>
              <div className="space-y-4">
                <CTAButton onClick={() => navigate("/login")} className="w-full hover:shadow-lg" style={{ backgroundColor: theme.primary, color: "white", boxShadow: `0 10px 30px -12px ${theme.primary}` }} aria-label="Se connecter">
                  <ShieldCheck className="w-5 h-5" /> Se connecter
                </CTAButton>
                <div className="text-center text-gray-500">ou</div>
                <CTAButton className="w-full border-2 hover:bg-gray-50" style={{ borderColor: theme.primary, color: theme.primary }} aria-label="S'inscrire">S'inscrire</CTAButton>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <p className="text-sm text-blue-800">Vous êtes un professionnel de santé ? <a className="font-semibold underline" href="#">Contactez-nous</a></p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
