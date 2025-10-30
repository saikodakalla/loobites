export interface MealListItem {
  id: string;
  primary: string;
  secondary: string;
  onSelect?: () => void;
  thumbnailClassName?: string;
}

export interface MealListProps {
  items: MealListItem[];
}

export function MealList({ items }: MealListProps) {
  return (
    <div className="history-list">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="meal-row"
          onClick={item.onSelect}
          aria-label={`Open ${item.secondary}`}
        >
          <div
            className={`meal-thumb ${item.thumbnailClassName || ""}`.trim()}
          />
          <div className="meal-text">
            <div className="meal-primary">{item.primary}</div>
            <div className="meal-secondary">{item.secondary}</div>
          </div>
          <div className="meal-chevron">›</div>
        </button>
      ))}
    </div>
  );
}

export default MealList;
