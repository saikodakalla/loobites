export interface Profile {
  id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

export interface MealItem {
  name: string;
  tags?: string[];
}

export interface MenuStation {
  station: string;
  items: MealItem[];
}

export interface ResidenceMenu {
  name: string;
  stations: MenuStation[];
}

export interface ApiResult<T> {
  data?: T;
  error?: string;
}

