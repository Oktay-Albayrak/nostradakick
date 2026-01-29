import styles from "./TrendingBar.module.css";

export default function TrendingBar() {
  // Plus tard, ces données viendront de ton API
  const trends = [
    { label: "🔥 Tendance", value: "85% sur Real Madrid" },
    { label: "⚠️ Surprise", value: "Le nul de City à 12%" },
    { label: "🏆 Leader", value: "Magicien du Kick (12W)" },
  ];

  return (
    <div className={styles.container}>
      {trends.map((trend, i) => (
        <div key={i} className={styles.trendItem}>
          <span className={styles.label}>{trend.label}</span>
          <span className={styles.value}>{trend.value}</span>
        </div>
      ))}
    </div>
  );
}
