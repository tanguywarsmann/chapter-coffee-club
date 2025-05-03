import { renderHook } from "@testing-library/react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { AuthProvider } from "@/contexts/AuthContext";

// Mock Supabase ou toute fonction dépendante
jest.mock("@/services/progressService", () => ({
  getUserReadingProgress: jest.fn().mockResolvedValue([
    {
      id: "1",
      user_id: "user123",
      book_id: "book123",
      total_pages: 300,
      current_page: 60,
      started_at: "2025-05-01T00:00:00.000Z",
      updated_at: "2025-05-02T00:00:00.000Z",
      status: "in_progress",
      streak_current: 3,
      streak_best: 5,
      total_chapters: 10,
      validations: [],
    },
  ]),
}));

describe("useReadingProgress", () => {
  it("charge la progression de lecture correctement", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useReadingProgress(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.readingProgress.length).toBe(1);
    expect(result.current.readingProgress[0].total_chapters).toBe(10);
    expect(result.current.error).toBeNull();
  });
});
