export function formatMenuId(menuId = "") {
  if (!menuId) return "";
  return menuId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function starsFor(rating = 0) {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating))));
  return `${"★".repeat(value)}${"☆".repeat(5 - value)}`;
}
