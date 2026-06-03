"use client";

import { API_URL } from "@/config/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { IUser } from "@/types/user";
import { useAuth } from "@/context/AuthContext";
import UserActions from "@/components/admin/UserActions";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

export default function AdminUsers() {
  const { isLoggedIn, role, authFetch } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<IUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isAuthorized = isLoggedIn && role === "ADMIN";

  // Vérification de l'authentification et du rôle ADMIN
  useEffect(() => {
    // Redirection si non authentifié ou non admin
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, role, router]);

  // Récupération des utilisateurs
  useEffect(() => {
    if (!isAuthorized) return;

    async function loadData() {
      try {
        setIsLoadingData(true);
        setError(null);

        const response = await authFetch(`${API_URL}/api/users`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setError("Erreur lors du chargement des utilisateurs");
        } else {
          const data = await response.json();
          setUsers(data);
        }
      } catch (e) {
        setError("Impossible de charger les utilisateurs");
        console.error("Erreur:", e);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [isAuthorized, authFetch]);

  if (!isAuthorized || isLoadingData) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Chargement...
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/admin" className={styles.backLink}>
          ← Retour au tableau de bord
        </Link>
        <h1 className={styles.title}>Gestionnaire users</h1>
      </div>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder="Rechercher un utilisateur..."
            className={styles.searchInput}
            aria-label="Rechercher un utilisateur"
          />
          <select className={styles.filterSelect}>
            <option value="all">Tous les rôles</option>
            <option value="MEMBER">Membre</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : users.length === 0 ? (
          <div className={styles.emptyMessage}>Aucun utilisateur trouvé</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`${styles.roleBadge} ${
                          user.role === "ADMIN" ? styles.adminBadge : ""
                        }`}
                      >
                        {user.role === "ADMIN" ? "Admin" : "Membre"}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <UserActions userId={user.id} username={user.username} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}