export const COMPETITION_NAMES_MAP: Record<string, string> = {
  PD: "La Liga",
  FL1: "Ligue 1",
  PL: "Premier League",
  BL1: "Bundesliga",
  SA: "Serie A",
  CL: "Champions League",
};

export const RIVALRIES = [
  // FRANCE (Ligue 1 - FL1)
  { teams: [524, 516], name: "Le Classique" }, // PSG - OM
  { teams: [523, 516], name: "L'Olympico" }, // OL - OM
  { teams: [529, 543], name: "Derby Breton" }, // Rennes - Nantes
  { teams: [521, 546], name: "Derby du Nord" }, // Lille - Lens

  // ANGLETERRE (Premier League - PL)
  { teams: [65, 66], name: "Manchester Derby" }, // City - United
  { teams: [64, 62], name: "Merseyside Derby" }, // Liverpool - Everton
  { teams: [57, 73], name: "North London Derby" }, // Arsenal - Spurs
  { teams: [57, 61], name: "London Derby" }, // Arsenal - Chelsea
  { teams: [66, 64], name: "North West Derby" }, // United - Liverpool

  // ESPAGNE (La Liga - PD)
  { teams: [86, 81], name: "El Clásico" }, // Real - Barça
  { teams: [77, 86], name: "El Viejo Clásico" }, // Athletic - Real
  { teams: [86, 78], name: "Derbi Madrileño" }, // Real - Atleti
  { teams: [81, 80], name: "Derbi Barcelonés" }, // Barça - Espanyol
  { teams: [559, 90], name: "El Gran Derbi" }, // Sevilla - Betis

  // ITALIE (Serie A - SA)
  { teams: [108, 98], name: "Derby della Madonnina" }, // Inter - Milan
  { teams: [110, 100], name: "Derby della Capitale" }, // Lazio - Roma
  { teams: [109, 108], name: "Derby d'Italia" }, // Juve - Inter
  { teams: [109, 98], name: "Derby d'Italia" }, // Juve - Milan
  { teams: [100, 98], name: "Clasico Capitalino" }, // Roma - Milan
  { teams: [100, 113], name: "Derby del Sole" }, // Roma - Napoli
  { teams: [100, 109], name: "Clasico" }, // Roma - Juve

  // ALLEMAGNE (Bundesliga - BL1)
  { teams: [4, 5], name: "Der Klassiker" }, // Bayern - Dortmund
];
