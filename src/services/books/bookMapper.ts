
import { Book } from "@/types/book";
import { BookRecord } from "./types";

export const mapBookFromRecord = (record: BookRecord): Book => ({
  id: record.id,
  title: record.title,
  author: record.author,
  coverImage: record.cover_url,
  description: record.description || "",
  totalChapters: Math.ceil(record.total_pages / 30),
  chaptersRead: 0,
  isCompleted: false,
  language: "français",
  categories: record.tags || [],
  pages: record.total_pages,
  publicationYear: new Date(record.created_at || Date.now()).getFullYear()
});
