
const getSpecialiteDisplay = (specialite) => {
  switch (specialite) {
    case 'Cardiology':
      return 'Cardiologie';
    case 'Dermatology':
      return 'Dermatologie';
    case 'Neurology':
      return 'Neurologie';
    case 'Pulmonology':
      return 'Pneumologie';
    default:
      return specialite;
  }
};

export { getSpecialiteDisplay };