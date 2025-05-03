
import { renderHook, act, waitFor } from "@testing-library/react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/contexts/AuthContext";
import { getBooksInProgressFromAPI, syncBookWithAPI } from "@/services/reading";
import { toast } from "sonner";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("@/services/reading");
jest.mock("sonner");

describe("useInProgressBooks", () => {
  const mockUser = { id: "test-user-id" };
  const mockBook = {
    id: "1",
    title: "Test Book",
    author: "Test Author",
    totalChapters: 10,
    chaptersRead: 5,
    isCompleted: false,
    language: "français",
    categories: ["test"],
    pages: 100,
    publicationYear: 2024,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getBooksInProgressFromAPI as jest.Mock).mockResolvedValue([mockBook]);
    (syncBookWithAPI as jest.Mock).mockResolvedValue(mockBook);
  });

  it("should fetch and return in-progress books", async () => {
    const { result } = renderHook(() => useInProgressBooks());

    await waitFor(() => {
      expect(result.current.currentBook).toEqual(mockBook);
      expect(result.current.inProgressBooks).toEqual([mockBook]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle progress update", async () => {
    const { result } = renderHook(() => useInProgressBooks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleProgressUpdate("1");
    });

    expect(syncBookWithAPI).toHaveBeenCalledWith(mockUser.id, "1");
    expect(getBooksInProgressFromAPI).toHaveBeenCalledWith(mockUser.id);
  });

  it("should handle errors during progress update", async () => {
    (syncBookWithAPI as jest.Mock).mockRejectedValue(new Error("Test error"));

    const { result } = renderHook(() => useInProgressBooks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleProgressUpdate("1");
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Erreur lors de la mise à jour de la progression"
    );
  });

  it("should handle empty book list", async () => {
    (getBooksInProgressFromAPI as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useInProgressBooks());

    await waitFor(() => {
      expect(result.current.currentBook).toBeNull();
      expect(result.current.inProgressBooks).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
