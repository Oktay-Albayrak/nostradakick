import z from "zod";


     // on définit un schéma de validation pour le username (doit être une chaîne de caractères valide)
    // afin d'éviter des erreurs avec TypeScript et Prisma
  export const usernameSchema = z.string()
    .min(3, { message: "Le username doit contenir au moins 3 caractères" }) // minimum 3 caractères
    .max(50, { message: "Le username ne doit pas dépasser 50 caractères" }) // maximum 50 caractères
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Le username ne peut contenir que des lettres, chiffres et underscores" }); // caractères autorisés




    // Schema servant à validé l'ID
  export const uuidSchema = z.object({
    id: z.uuid(),
  });