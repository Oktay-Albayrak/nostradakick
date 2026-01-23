"use client"

import { useAuth } from "@/context/AuthContext";
import { notFound, useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const { logout } = useAuth();

  async function disconnection() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/auth/logout`, {
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

