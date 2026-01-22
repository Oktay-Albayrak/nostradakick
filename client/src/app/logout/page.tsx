"use client"

import { useAuth } from "@/context/AuthContext";
import { notFound, useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const { logout } = useAuth();

  async function disconnection() {
    try {
      const response = await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: 'include'
      })

      if (!response.ok) {
        notFound();
      }
      logout();
      router.push("/");

    } catch (e) {
      console.error("error : ", e as Error);
    }
  }

  disconnection();
  
  return (
    <></>
  );
}

