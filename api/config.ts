export const config = {
  port: Number.parseInt(process.env.PORT || "4000"),
  allowedOrigin: getEnv(process.env.ALLOWED_ORIGIN, "ALLOWED_ORIGIN"),
  jwtSecret: getEnv(process.env.JWT_SECRET, "JWT_SECRET"),
};

// Cette fonction sert à vérifier que les variable d'environnement sont bien configurer et nous mettre une erreur si aucune donnée dans un .env
function getEnv(variable: string | undefined, variableName: string): string {
  if (!variable) {
    throw new Error(`Missing Environnement variable ${variableName}`);
  }

  return variable;
}
