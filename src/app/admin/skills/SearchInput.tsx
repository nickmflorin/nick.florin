"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition, useCallback } from "react";

import clsx from "clsx";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";

import { logger } from "~/application/logger";
import { createSkill } from "~/actions/createSkill";
import { Button } from "~/components/buttons/generic";
import { TextInput } from "~/components/input/TextInput";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

interface SearchInputProps extends ComponentProps {}

const isEnterEvent = (e: React.KeyboardEvent<HTMLDivElement>) => e.key === "Enter" && !e.shiftKey;

export const SearchInput = (props: SearchInputProps) => {
  const { replace, refresh } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [_, transition] = useTransition();
  const [value, setValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (e.target.value) {
      params.set("search", e.target.value);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
    const v = searchParams?.get("search")?.toString() ?? "";
    setValue(v);
  }, [searchParams]);

  const create = useCallback(async () => {
    setIsCreating(true);
    try {
      await createSkill({ label: value });
      transition(() => {
        refresh();
      });
    } catch (e) {
      logger.error(e);
      toast.error("There was an error creating the skill.");
    } finally {
      setIsCreating(false);
    }
  }, [value, refresh]);

  return (
    <TextInput
      {...props}
      value={value}
      onChange={e => {
        setValue(e.target.value);
        handleSearch(e);
      }}
      onKeyDown={e => {
        if (isEnterEvent(e)) {
          create();
        }
      }}
      actions={
        value.trim().length >= 3
          ? {
              right: [
                <div key="0" className="flex flex-row gap-[2px] items-center">
                  <Button.Bare
                    className={clsx(
                      "px-[8px] py-[2px] bg-gray-200 hover:bg-gray-300 min-h-[26px] h-[26px]",
                    )}
                    size="xsmall"
                    isLoading={isCreating}
                    onClick={async () => create()}
                  >
                    Add
                  </Button.Bare>
                  (
                  <Text
                    size="xxs"
                    className="font-mono bg-gray-100 font-sm px-[5px] py-[3px] rounded-sm"
                  >
                    Enter
                  </Text>
                  )
                </div>,
              ],
            }
          : []
      }
    />
  );
};
