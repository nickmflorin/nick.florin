"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback } from "react";

import clsx from "clsx";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";

import { logger } from "~/application/logger";
import { isRecordType } from "~/lib/typeguards";
import { Button } from "~/components/buttons/generic";
import { TextInput } from "~/components/input/TextInput";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { useMutableParams } from "~/hooks";

export interface TableSearchInputProps extends ComponentProps {
  readonly initialValue: string;
  readonly onCreate?: (value: string) => Promise<void>;
}

const isEnterEvent = (e: React.KeyboardEvent<HTMLDivElement>) => e.key === "Enter" && !e.shiftKey;

export const TableSearchInput = ({ onCreate, initialValue, ...props }: TableSearchInputProps) => {
  const { refresh } = useRouter();
  const { set } = useMutableParams();
  const [_, transition] = useTransition();
  const [value, setValue] = useState(initialValue);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    set("filters", curr =>
      isRecordType(curr)
        ? {
            ...curr,
            search: e.target.value,
          }
        : { search: e.target.value },
    );
  }, 100);

  const create = useCallback(async () => {
    if (onCreate) {
      setIsCreating(true);
      try {
        await onCreate(value);
        transition(() => {
          refresh();
        });
      } catch (e) {
        logger.error(`There was an error creating the skill:\n${e}`, {
          error: e,
          data: { label: value },
        });
        toast.error("There was an error creating the skill.");
      } finally {
        setIsCreating(false);
      }
    }
  }, [value, onCreate, refresh]);

  return (
    <TextInput
      {...props}
      className={clsx("grow", props.className)}
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
        value.trim().length >= 3 && onCreate
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
                    fontSize="xxs"
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

export default TableSearchInput;
