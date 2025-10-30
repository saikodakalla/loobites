export interface MenuCardProps {
  title: string;
  tags?: string[];
  onSelect?: () => void;
  className?: string;
}

export function MenuCard({
  title,
  tags,
  onSelect,
  className = "",
}: MenuCardProps) {
  return (
    <button
      type="button"
      className={`dish-card ${className}`.trim()}
      onClick={onSelect}
    >
      <div className="dish-media" />
      <div className="dish-title">{title}</div>
      <div className="dish-meta">
        {tags && tags.length ? tags.join(" · ") : "\u00A0"}
      </div>
    </button>
  );
}

export default MenuCard;
