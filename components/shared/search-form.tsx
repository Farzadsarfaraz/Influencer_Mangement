import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SearchForm({
  defaultValue,
  placeholder,
}: {
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <form className="relative w-full max-w-sm">
      <Label htmlFor="search-q" className="sr-only">
        {placeholder}
      </Label>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="search-q"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="pl-8"
      />
    </form>
  );
}
