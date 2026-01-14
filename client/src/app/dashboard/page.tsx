import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default async function DashboardPage() {
  // const userData = await getUserData();
  // const predictions = await getUserPredictions();
  // const stats = await getUserStats();

  return (
    <main className={styles.main}>
      <section className={styles.profil}>
        <Image
          className={styles.avatar}
          src="/default-avatar.jpg"
          width={200}
          height={200}
          alt="Avatar du membre"
        />
        <div className={styles.bio}>
          <h2>ParisienFou</h2>
          <p>Membre depuis 02/2021</p>
          <p>600 pronostics</p>
          <p>5450 points gagnés</p>
          <Link href="/profil/edit" className={styles.editButton}>
            Modifier mon profil
          </Link>
        </div>
      </section>
      <div className={styles.wrapper}>
        <section className={styles.pronos}>
          <h2>Mes derniers pronos</h2>
          <div>
            <article className={styles.prono}>
              <p>Havre AC - O. de Marseille</p>
              <div className={styles.choice}>
                <p className={styles.active}>1</p>
                <p>N</p>
                <p>2</p>
              </div>
            </article>
            <article className={styles.prono}>
              <p>Paris FC - O. Lyonnais</p>
              <div className={styles.choice}>
                <p className={styles.active}>1</p>
                <p>N</p>
                <p>2</p>
              </div>
            </article>
            <article className={styles.prono}>
              <p>Paris SG - Lille</p>
              <div className={styles.choice}>
                <p className={styles.active}>1</p>
                <p>N</p>
                <p>2</p>
              </div>
            </article>
            <article className={styles.prono}>
              <p>SC Frileuse - Havre CS</p>
              <div className={styles.choice}>
                <p>1</p>
                <p className={styles.active}>N</p>
                <p>2</p>
              </div>
            </article>
          </div>
        </section>
        <section className={styles.stats}>
          <h2>Mes stats</h2>
          <div>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/croissance.png"
                width={50}
                height={50}
                alt="Meilleure série gagnante"
              />
              <p>Meilleure série gagnante : 12</p>
            </article>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/prix.png"
                width={50}
                height={50}
                alt="Pronostics L.1 gagnants"
              />
              <p>Pronostics L.1 gagnants : 372</p>
            </article>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/taux.png"
                width={50}
                height={50}
                alt="Taux de réussite"
              />
              <p>Taux de réussite : 78 %</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
