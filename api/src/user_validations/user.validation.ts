import z from "zod";
import { usernameSchema } from "./utils.validation.ts";

export const updateUserSchema = z.object({
    username: usernameSchema.optional(),

    password: z.string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .max(100, { message: "Le mot de passe ne doit pas dépasser 100 caractères" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre" })
    .optional(),

    email: z.email( { message: "L'email n'est pas valide" } )
    .optional(),

    avatar_url: z.url( { message: "Veuillez entrer une URL valide"} )
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;