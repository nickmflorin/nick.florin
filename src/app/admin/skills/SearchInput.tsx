"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDebouncedCallback } from "use-debounce";

import { TextInput } from "~/components/input/TextInput";
import { type ComponentProps } from "~/components/types";

interface SearchInputProps extends ComponentProps {}

export const SearchInput = (props: SearchInputProps) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set("search", e.target.value);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <TextInput
      {...props}
      onChange={e => handleSearch(e)}
      defaultValue={searchParams.get("search")?.toString() ?? ""}
    />
  );
};
