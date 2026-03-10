
import { ArrowDownAZ, Book, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/i18n/LanguageContext";

export type SortOption = "date" | "author" | "pages";

interface BookSortSelectProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
}

export function BookSortSelect({ value, onValueChange }: BookSortSelectProps) {
  const { t } = useTranslation();
  const rl = t.readingList;

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger className="w-[180px]">
        <ArrowDownAZ className="mr-2 h-4 w-4" />
        <SelectValue placeholder={rl.sortBy} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date">
          <span className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {rl.sortDate}
          </span>
        </SelectItem>
        <SelectItem value="author">
          <span className="flex items-center">
            <Book className="mr-2 h-4 w-4" />
            {rl.sortAuthor}
          </span>
        </SelectItem>
        <SelectItem value="pages">
          <span className="flex items-center">
            <Book className="mr-2 h-4 w-4" />
            {rl.sortPages}
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
