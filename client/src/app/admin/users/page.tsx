import Link from "next/link";
import styles from "./page.module.css";
import { IUser } from "@/types/user";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

export default async function AdminUsers() {
  let users: IUser[] = [];
  let error: string | null = null;

  try {
    const response = await fetch("http://localhost:4000/api/users", {
      cache: "no-store",
    });

    if (!response.ok) {
      error = "Erreur lors du chargement des utilisateurs";
    } else {
      users = await response.json();
    }
  } catch (e) {
    error = "Impossible de charger les utilisateurs";
    console.error("Erreur:", e);
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
                      <div className={styles.actions}>
                        <Link
                          href={`/profil/${user.username}`}
                          className={styles.actionButton}
                        >
                          Voir
                        </Link>
                        <button
                          className={styles.actionButton}
                          title="Modifier (à implémenter)"
                        >
                          Modifier
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.resetButton}`}
                          title="Réinitialiser mot de passe (à implémenter)"
                        >
                          Reset MDP
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Supprimer (à implémenter)"
                        >
                          Supprimer
                        </button>
                      </div>
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
