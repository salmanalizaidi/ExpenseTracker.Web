/**
 * Category type — mirrors the backend CategoryDto.
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}
