
import { toast } from "sonner";
import { Book } from "@/types/book";
import { fetchBooksForStatus } from "@/services/reading/readingListService";

export async function safeFetchBooksForStatus(readingList: any, status: string, userId: string): Promise<Book[]> {
  try {
    if (!readingList) return [];
    const result = await fetchBooksForStatus(readingList, status, userId);
    return result || [];
  } catch (e) {
    toast.error("Erreur de récupération des livres pour le statut : " + status);
    return [];
  }
}
