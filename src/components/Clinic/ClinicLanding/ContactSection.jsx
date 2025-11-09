import React from "react";
import Card from "./Card";
import CTAButton from "./CTAButton";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactSection({ clinic, theme, withAlpha }) {
  return (
    <section id="contact" className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nous contacter</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Nos coordonnées</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <span className="inline-flex p-2 rounded-xl" style={{ background: withAlpha(theme.primary,.12), color: theme.primary }}>
                    <MapPin className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-gray-600">{clinic.address || "Adresse non spécifiée"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="inline-flex p-2 rounded-xl" style={{ background: withAlpha(theme.primary,.12), color: theme.primary }}>
                    <Phone className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-gray-600">{clinic.phone || "Non spécifié"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="inline-flex p-2 rounded-xl" style={{ background: withAlpha(theme.primary,.12), color: theme.primary }}>
                    <Mail className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{clinic.email || "Non spécifié"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="inline-flex p-2 rounded-xl" style={{ background: withAlpha(theme.primary,.12), color: theme.primary }}>
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-medium">Horaires</p>
                    <p className="text-gray-600">{clinic.hours || "Lun - Ven : 8h - 18h"}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Envoyez‑nous un message</h3>
              <form className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid">
                    <span className="text-sm text-gray-600 mb-1">Votre nom</span>
                    <input type="text" className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                  </label>
                  <label className="grid">
                    <span className="text-sm text-gray-600 mb-1">Votre email</span>
                    <input type="email" className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="exemple@mail.com" />
                  </label>
                </div>
                <label className="grid">
                  <span className="text-sm text-gray-600 mb-1">Sujet</span>
                  <input type="text" className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Prise de rendez-vous" />
                </label>
                <label className="grid">
                  <span className="text-sm text-gray-600 mb-1">Votre message</span>
                  <textarea rows={4} className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Bonjour, je souhaiterais…" />
                </label>
                <CTAButton type="submit" className="w-full" style={{ backgroundColor: theme.primary, color: "white" }}>Envoyer le message</CTAButton>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
