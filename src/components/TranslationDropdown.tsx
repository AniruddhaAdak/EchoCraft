import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { translationLanguages } from "@/utils/languages";

interface TranslationDropdownProps {
  onLanguageSelect: (language: string) => void;
}

export const TranslationDropdown = ({ onLanguageSelect }: TranslationDropdownProps) => {
  return (
    <Select onValueChange={onLanguageSelect}>
      <SelectTrigger className="w-[220px] rounded-full border-fuchsia-200 bg-white/80 backdrop-blur">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {translationLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};