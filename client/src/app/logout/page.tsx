"use client"

import { API_URL } from "@/config/api";

import { useAuth } from "@/context/AuthContext";
import { notFound, useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const { logout } = useAuth();

  async function disconnection() {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
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

