// Dans votre composant de test ou dans un fichier séparé
export const mockClinic = {
  id: "1",
  name: "Clinique Les Jardins de la Santé",
  slogan: "Votre bien-être, notre engagement",
  description: "Une clinique moderne au cœur de la ville, dédiée à votre santé et votre confort.",
  longDescription: "Fondée en 2010, la Clinique Les Jardins de la Santé s'est imposée comme une référence en matière de soins médicaux de qualité. Notre équipe de 50 professionnels de santé vous accueille dans un environnement moderne et chaleureux, équipé des dernières technologies médicales.",
  
  // Couleurs personnalisées
  primaryColor: "#2E8B57", // Sea Green
  secondaryColor: "#4682B4", // Steel Blue
  accentColor: "#FF6B6B", // Coral Red
  backgroundColor: "#FAFAFA",
  textColor: "#2C3E50",
  
  // Contact et informations
  address: "123 Avenue des Roses, 75008 Paris",
  phone: "+33 1 45 67 89 00",
  email: "contact@jardins-sante.fr",
  hours: "Lun - Ven: 7h - 20h | Sam: 8h - 18h | Urgences 24h/24",
  
  // Images
  logo: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop",
  heroImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=600&fit=crop",
  aboutImage: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
  
  // Services
  services: [
    {
      id: 1,
      name: "Médecine Générale",
      description: "Consultations complètes et suivi médical personnalisé pour toute la famille.",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Cardiologie",
      description: "Diagnostic et traitement des maladies cardiovasculaires avec équipement de pointe.",
      image: "https://res.cloudinary.com/void-elsan/image/upload/f_auto/q_90/v1/inline-images/cardiologie-%28personnalise%29.jpg?_a=BAAAV6E0"
    },
    {
      id: 3,
      name: "Pédiatrie",
      description: "Soins spécialisés pour les enfants dans un environnement adapté et rassurant.",
      image: "https://hmebingerville.ci/storage/speciality_images/DYH6QajN3LOcnaMSHzzGtF85sgLvRkr8U3MgTUOH.png"
    },
    {
      id: 4,
      name: "Radiologie",
      description: "Imagerie médicale avancée avec des technologies de dernière génération.",
      image: "https://res.cloudinary.com/void-elsan/image/upload/f_auto/q_90/v1/inline-images/radiologie-%28personnalise%29.jpg?_a=BAAAV6E0"
    },
    {
      id: 5,
      name: "Chirurgie Ambulatoire",
      description: "Interventions chirurgicales avec hospitalisation de courte durée.",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      name: "Urgences 24/7",
      description: "Service d'urgence permanent avec équipe médicale dédiée.",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop"
    }
  ],
  
  // Équipe médicale (optionnel)
  medicalTeam: [
    {
      id: 1,
      name: "Dr. Sophie Martin",
      specialty: "Médecin Généraliste",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"
    },
    {
      id: 2,
      name: "Dr. Pierre Dubois",
      specialty: "Cardiologue",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop"
    }
  ],
  
  // Témoignages (optionnel)
  testimonials: [
    {
      id: 1,
      name: "Marie L.",
      text: "Un personnel attentionné et des soins de qualité. Je recommande vivement cette clinique !",
      rating: 5
    },
    {
      id: 2,
      name: "Jean D.",
      text: "Matériel moderne et équipe compétente. Très satisfait de mon traitement.",
      rating: 4
    }
  ]
};

// Version alternative avec des couleurs différentes pour tester
export const mockClinicViolet = {
  ...mockClinic,
  name: "Clinique Harmonie Santé",
  primaryColor: "#8B5CF6", // Violet
  secondaryColor: "#7C3AED", // Violet foncé
  accentColor: "#F59E0B", // Amber
  slogan: "L'excellence médicale au service de votre santé"
};

// Version avec thème bleu classique
export const mockClinicBlue = {
  ...mockClinic,
  name: "Centre Médical Modern",
  primaryColor: "#1E40AF", // Blue
  secondaryColor: "#1D4ED8", // Blue dark
  accentColor: "#DC2626", // Red
  slogan: "Des soins avancés pour une vie meilleure"
};