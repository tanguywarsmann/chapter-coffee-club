
// Centralise tous les exports de services user
export * from "./userGoalsService";
export * from "./streakBadgeService";
export * from "./favoriteBadgesService";
export * from "./levelService";
export * from "./userProfileService";
export * from "./profileService";

// Export favorite badges functions
export { 
  getFavoriteBadges,
  getUserFavoriteBadges,
  addFavoriteBadge,
  removeFavoriteBadge,
  toggleFavoriteBadge
} from "./favoriteBadgesService";

// Export favorite books functions
export {
  getUserFavoriteBooks,
  addFavoriteBook,
  removeFavoriteBook
} from "./favoriteBookService";
