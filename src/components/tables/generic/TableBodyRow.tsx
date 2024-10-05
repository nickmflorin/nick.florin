"use client";
import { useState } from "react";

import { classNames, parseDataAttributes } from "~/components/types";
import { type ClassName } from "~/components/types";

import { AbstractTableRow, type AbstractTableRowProps } from "./AbstractTableRow";

export interface TableBodyRowProps extends AbstractTableRowProps {
  readonly hoveredClassName?: ClassName;
  readonly isHovered?: boolean;
  readonly isLoading?: boolean;
  readonly highlightOnHover?: boolean;
  readonly bordered?: boolean;
  readonly isLocked?: boolean;
}

export const TableBodyRow = ({
  hoveredClassName = "",
  isHovered: propIsHovered,
  bordered = true,
  highlightOnHover: _highlightOnHover,
  isLoading = false,
  isLocked = false,
  ...props
}: TableBodyRowProps) => {
  const [_isHovered, setIsHovered] = useState(false);
  const isHovered = propIsHovered ?? _isHovered;
  const defaultHighlightOnHover = propIsHovered !== undefined ? true : false;
  const highlightOnHover = _highlightOnHover ?? defaultHighlightOnHover;

  return (
    <AbstractTableRow
      {...props}
      {...parseDataAttributes({
        highlighted: isHovered && highlightOnHover,
        isLoading,
        isLocked,
        bordered,
      })}
      className={classNames(
        "table__body-row",
        { ["cursor-pointer"]: props.onClick },
        { [classNames(hoveredClassName)]: isHovered },
        props.className,
      )}
      onMouseEnter={e => {
        setIsHovered(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={e => {
        setIsHovered(false);
        props.onMouseLeave?.(e);
      }}
    />
  );
};

export default TableBodyRow;
