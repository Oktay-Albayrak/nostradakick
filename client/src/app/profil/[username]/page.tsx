import Image from "next/image";
import styles from "./page.module.css";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params;
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
          <h2>{username}</h2>
          <p>Membre depuis 02/2021</p>
          <p>587 pronostics</p>
          <p>1231 points</p>
        </div>
      </section>
      <div className={styles.wrapper}>
        <section className={styles.pronos}>
          <h2>Derniers pronos</h2>
          <div>
            <article className={styles.prono}>
              <p>PSG - Lens</p>
              <div className={styles.choice}>
                <p>1</p>
                <p>N</p>
                <p className={styles.active}>2</p>
              </div>
            </article>
            <article className={styles.prono}>
              <p>Lille - OM</p>
              <div className={styles.choice}>
                <p className={styles.active}>1</p>
                <p>N</p>
                <p>2</p>
              </div>
            </article>
            <article className={styles.prono}>
              <p>OL - Monaco</p>
              <div className={styles.choice}>
                <p className={styles.active}>1</p>
                <p>N</p>
                <p>2</p>
              </div>
            </article>
            <article className={styles.prono}>
              <p>Brest - Reims</p>
              <div className={styles.choice}>
                <p>1</p>
                <p className={styles.active}>N</p>
                <p>2</p>
              </div>
            </article>
          </div>
        </section>
        <section className={styles.stats}>
          <h2>Statistiques</h2>
          <div>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/croissance.png"
                width={50}
                height={50}
                alt="Logo - Retourner vers l'accueil"
              />
              <p>Meilleure série: 12</p>
            </article>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/prix.png"
                width={50}
                height={50}
                alt="Logo - Retourner vers l'accueil"
              />
              <p>Pronos gagnants: 250</p>
            </article>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/taux.png"
                width={50}
                height={50}
                alt="Logo - Retourner vers l'accueil"
              />
              <p>Taux de réuissite: 53%</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}