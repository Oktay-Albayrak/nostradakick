import Image from "next/image";

export default function MatchCard() {
  return (
    <div>
      <article>
        <section>
          <div>Competition</div>
          <span>🔥</span>
          <div>
            <p>Date</p>
            <p>Heure</p>
          </div>
        </section>
        <section>
          <Image
            src="https://crests.football-data.org/524.png"
            alt="logo_paris-saint-germain"
            width={64}
            height={64}
          />
          <Image
            src="https://crests.football-data.org/516.png"
            alt="logo_olympique-marseille"
            width={64}
            height={64}
          />
        </section>
        <section>
          <button>Paris Saint-Germain</button>
          <button>Match Nul</button>
          <button>Olympique de Marseille</button>
        </section>
      </article>
    </div>
  );
}
