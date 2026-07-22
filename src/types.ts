export interface Review {
  id: string;
  characterId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  category: string;
  tags: string[];
  shortDescription: string;
  plot: string;
  chatLink: string;
  rating: number; // Average rating
  reviewCount: number;
  reviews: Review[];
  createdAt: string;
  isCustom?: boolean; // True if created by the admin user
  likes?: number; // Number of likes/favorites
}

export interface FilterState {
  search: string;
  category: string;
  tags: string[];
  sortBy: 'popular' | 'rating' | 'newest';
}
