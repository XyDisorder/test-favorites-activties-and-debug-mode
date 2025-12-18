import { describe, it, expect, beforeEach } from "vitest";
import { useFavoriteStore } from "./favoriteStore";

describe("favoriteStore", () => {
  beforeEach(() => {
    useFavoriteStore.getState().clear();
  });

  it("should initialize with empty state", () => {
    const state = useFavoriteStore.getState();
    expect(state.favorites).toEqual({});
  });

  it("should set and get favorite status", () => {
    const { setFavorite, getFavorite } = useFavoriteStore.getState();
    
    setFavorite("activity-1", true);
    expect(getFavorite("activity-1")).toBe(true);
    
    setFavorite("activity-1", false);
    expect(getFavorite("activity-1")).toBe(false);
  });

  it("should return null for undefined favorite", () => {
    const { getFavorite } = useFavoriteStore.getState();
    expect(getFavorite("activity-unknown")).toBe(null);
  });

  it("should handle multiple favorites independently", () => {
    const { setFavorite, getFavorite } = useFavoriteStore.getState();
    
    setFavorite("activity-1", true);
    setFavorite("activity-2", true);
    setFavorite("activity-3", false);
    
    expect(getFavorite("activity-1")).toBe(true);
    expect(getFavorite("activity-2")).toBe(true);
    expect(getFavorite("activity-3")).toBe(false);
  });

  it("should clear all favorites", () => {
    const { setFavorite, clear, getFavorite } = useFavoriteStore.getState();
    
    setFavorite("activity-1", true);
    setFavorite("activity-2", true);
    clear();
    
    expect(getFavorite("activity-1")).toBe(null);
    expect(getFavorite("activity-2")).toBe(null);
  });
});

