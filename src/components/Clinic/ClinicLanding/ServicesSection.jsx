import React from "react";
import Card from "./Card";
import ClinicImage from "./ClinicImage";
import { ArrowRight, Stethoscope, HeartPulse, Activity } from "lucide-react";

export default function ServicesSection({ clinic, theme }) {
  const services = clinic.services?.length ? clinic.services : [
    { icon: HeartPulse, name: "Consultations générales", description: "Soins complets pour toute la famille." },
    { icon: Activity, name: "Spécialités", description: "Accès à divers spécialistes médicaux." },
    { icon: Stethoscope, name: "Urgences", description: "Service disponible 24h/24." },
  ];

  return (
    <section id="services" className="py-16 bg-gray-50/60">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Nos services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <Card key={idx} className="overflow-hidden">
              {service.image ? (
                <div className="relative">
                  <ClinicImage src={service.image} alt={service.name} className="w-full h-44" rounded="rounded-2xl rounded-b-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white/95 font-semibold flex items-center gap-2">
                    {service.icon ? <service.icon className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                    {service.name}
                  </div>
                </div>
              ) : (
                <div className="p-6 pb-2 flex items-center gap-3">
                  {service.icon ? <service.icon className="w-6 h-6" style={{ color: theme.primary }} /> : <Stethoscope className="w-6 h-6" style={{ color: theme.primary }} />}
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                </div>
              )}
              <div className="p-6 pt-4">
                {service.image && <h3 className="text-lg font-semibold mb-2">{service.name}</h3>}
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button className="inline-flex items-center gap-2 font-semibold group/lnk" style={{ color: theme.primary }}>
                  En savoir plus
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/lnk:translate-x-0.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
