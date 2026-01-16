"use client"

import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  async function logout() {
    try {
      const response = await fetch("http://localhost:4000/api/auth/logout", {
        method: "GET",
        credentials: 'include'
      })

      if (!response.ok) {
        router.push("/404");
      }
      router.refresh();
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/");

    } catch (e) {
      console.error("error : ", e as Error);
    }
  }

  logout();
  
  return (
    <></>
  );
}

