'use client';
import { useState } from 'react';

import { type ClassName, classNames, parseDataAttributes } from '~/components/types';

import { AbstractTableRow, type AbstractTableRowProps } from './AbstractTableRow';

export interface TableBodyRowProps extends AbstractTableRowProps {
  readonly hoveredClassName?: ClassName;
  readonly isBordered?: boolean;
  readonly isHovered?: boolean;
  readonly isLoading?: boolean;
  readonly isLocked?: boolean;
  readonly shouldHighlightOnHover?: boolean;
}

export const TableBodyRow = ({
  hoveredClassName = '',
  isBordered = true,
  isHovered: propIsHovered,
  isLoading = false,
  isLocked = false,
  shouldHighlightOnHover: _highlightOnHover,
  ...props
}: TableBodyRowProps) => {
  const [internalIsHovered, setInternalIsHovered] = useState(false);
  const isHovered = propIsHovered ?? internalIsHovered;
  const defaultHighlightOnHover = propIsHovered !== undefined;
  const highlightOnHover = _highlightOnHover ?? defaultHighlightOnHover;

  return (
    <AbstractTableRow
      {...props}
      {...parseDataAttributes({
        bordered: isBordered,
        highlighted: isHovered && highlightOnHover,
        isLoading,
        isLocked,
      })}
      className={classNames(
        'table__body-row',
        { ['cursor-pointer']: props.onClick },
        { [classNames(hoveredClassName)]: isHovered },
        props.className,
      )}
      onMouseEnter={e => {
        setInternalIsHovered(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={e => {
        setInternalIsHovered(false);
        props.onMouseLeave?.(e);
      }}
    />
  );
};
