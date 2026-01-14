import Image from "next/image";
import styles from "./page.module.css"


export default async function Pronos() {
    
    return (
      <main className={styles.main}>
        {/* SEARCH BAR */}
        <section className={styles.searchSection}>
          <input
            type="search"
            placeholder="Rechercher un match ou une compétition ..."
            className={styles.searchInput}
            aria-label="Rechercher un match ou une compétition"
          />
        </section>




        {/* CONTENU PRINCIPAL - Liste des pronostics */}
        <section className={styles.mainGrid}>
          
          <h1 className={styles.sectionTitleH1}>Pronostics des membres du sites</h1>

          <div className={styles.pronoList}>
            <div className={styles.pronoRow}>
                
              <div className={styles.userInfo}>
                <Image
                  className={styles.avatar}
                  src="/default-avatar.jpg"
                  width={200}
                  height={200}
                  alt="Avatar du membre"
                />
                  
                <div className={styles.profilColumn}>
                  <span className={styles.username}>HACmen</span>
                  <span className={styles.timestamp}>il y a 2 minutes</span>
                </div>
              </div>
                  

              <div className= {styles.matchInfo}>
                <div className={styles.pronoLabel}>Le Havre AC - Olympique de Marseille</div>
                <div className={styles.picks}>
                  <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                  <span className={styles.pick}>N</span>
                  <span className={styles.pick}>2</span>
                </div>
              </div>
            </div>




            <div className={styles.pronoRow}>
                
              <div className={styles.userInfo}>
                <Image
                  className={styles.avatar}
                  src="/default-avatar.jpg"
                  width={200}
                  height={200}
                  alt="Avatar du membre"
                />
                  
                <div className={styles.profilColumn}>
                  <span className={styles.username}>ParisienFou</span>
                  <span className={styles.timestamp}>il y a 4 minutes</span>
                </div>
              </div>
                  

              <div className= {styles.matchInfo}>
                <div className={styles.pronoLabel}>Paris FC - Olympique Lyonnais</div>
                <div className={styles.picks}>
                  <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                  <span className={styles.pick}>N</span>
                  <span className={styles.pick}>2</span>
                </div>
              </div>
            </div>




            <div className={styles.pronoRow}>
                
              <div className={styles.userInfo}>
                <Image
                  className={styles.avatar}
                  src="/default-avatar.jpg"
                  width={200}
                  height={200}
                  alt="Avatar du membre"
                />
                  
                <div className={styles.profilColumn}>
                  <span className={styles.username}>ParisienFou</span>
                  <span className={styles.timestamp}>il y a 5 minutes</span>
                </div>
              </div>
                  

              <div className= {styles.matchInfo}>
                <div className={styles.pronoLabel}>Paris Saint-Germain FC - Lille OSC</div>
                <div className={styles.picks}>
                  <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                  <span className={styles.pick}>N</span>
                  <span className={styles.pick}>2</span>
                </div>
              </div>
            </div>




            <div className={styles.pronoRow}>
                
              <div className={styles.userInfo}>
                <Image
                  className={styles.avatar}
                  src="/default-avatar.jpg"
                  width={200}
                  height={200}
                  alt="Avatar du membre"
                />
                  
                <div className={styles.profilColumn}>
                  <span className={styles.username}>MomoHenni</span>
                  <span className={styles.timestamp}>il y a 8 minutes</span>
                </div>
              </div>
                  

              <div className= {styles.matchInfo}>
                <div className={styles.pronoLabel}>Le Havre AC - Olympique de Marseille</div>
                <div className={styles.picks}>
                  <span className={styles.pick}>1</span>
                  <span className={styles.pick}>N</span>
                  <span className={`${styles.pick} ${styles.pickActive}`}>2</span>
                </div>
              </div>
            </div>




            <div className={styles.pronoRow}>
                
              <div className={styles.userInfo}>
                <Image
                  className={styles.avatar}
                  src="/default-avatar.jpg"
                  width={200}
                  height={200}
                  alt="Avatar du membre"
                />
                  
                <div className={styles.profilColumn}>
                  <span className={styles.username}>Arturo</span>
                  <span className={styles.timestamp}>il y a 11 minutes</span>
                </div>
              </div>
                  

              <div className= {styles.matchInfo}>
                <div className={styles.pronoLabel}>Paris FC - Olympique Lyonnais</div>
                <div className={styles.picks}>
                  <span className={styles.pick}>1</span>
                  <span className={`${styles.pick} ${styles.pickActive}`}>N</span>
                  <span className={styles.pick}>2</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
}