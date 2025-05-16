
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCurrentReading } from "../useCurrentReading";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingList } from "@/hooks/useReadingList";
import { toast } from "sonner";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("@/hooks/useReadingList");
jest.mock("sonner");

describe("useCurrentReading", () => {
  const mockUser = { id: "test-user-id" };
  const mockBook = {
    id: "1",
    title: "Test Book",
    author: "Test Author",
    totalChapters: 10,
    chaptersRead: 5,
    isCompleted: false,
    isUnavailable: false,
    isStableUnavailable: false,
    language: "français",
    categories: ["test"],
    pages: 100,
    publicationYear: 2024,
    cover_url: "test-cover.jpg",
    description: "Test description",
    progressPercent: 50,
    nextSegmentPage: 30,
    expectedSegments: 10,
    totalSegments: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useReadingList as jest.Mock).mockReturnValue({
      getBooksByStatus: jest.fn().mockResolvedValue([mockBook]),
    });
  });

  it("should return current reading book when available", async () => {
    const { result } = renderHook(() => useCurrentReading());

    await waitFor(() => {
      expect(result.current.currentReading).toEqual(mockBook);
      expect(result.current.isLoadingCurrentBook).toBe(false);
    });
  });

  it("should handle unavailable books", async () => {
    const unavailableBook = { ...mockBook, isUnavailable: true };
    (useReadingList as jest.Mock).mockReturnValue({
      getBooksByStatus: jest.fn().mockResolvedValue([unavailableBook]),
    });

    const { result } = renderHook(() => useCurrentReading());

    await waitFor(() => {
      expect(result.current.currentReading?.isStableUnavailable).toBe(true);
      expect(result.current.isLoadingCurrentBook).toBe(false);
    });
  });

  it("should handle error cases", async () => {
    (useReadingList as jest.Mock).mockReturnValue({
      getBooksByStatus: jest.fn().mockRejectedValue(new Error("Test error")),
    });

    const { result } = renderHook(() => useCurrentReading());

    await waitFor(() => {
      expect(result.current.currentReading).toBeNull();
      expect(result.current.isLoadingCurrentBook).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Impossible de charger votre lecture en cours"
      );
    });
  });
});
