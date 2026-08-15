export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  parentId: number | null;
  parentName: string | null;
  children: CategorySummary[];
}
