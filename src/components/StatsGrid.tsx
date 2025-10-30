export interface StatItem {
  label: string;
  value: number | string;
}

export interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className="stat-tile" key={stat.label}>
          <div className="num">{stat.value}</div>
          <div className="label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
