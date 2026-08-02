import { type JSX, type ReactNode } from 'react';

import { type DataMenuCustomModel, type DataMenuModel } from './data-menu-models';

/* ------------------------------ Data Menu Model Processing -----------------------------------*/
export type DataMenuProcessedGroup<M extends DataMenuModel> = {
  readonly data: DataMenuProcessedModel<M>[];
  readonly isCustom?: never;
  readonly isGroup: true;
  readonly label?: ReactNode;
};

export type DataMenuProcessedModel<M extends DataMenuModel> = {
  readonly index: number;
  readonly isCustom: false;
  readonly isGroup?: false;
  readonly model: M;
};

export type DataMenuProcessedCustom = {
  readonly index: number;
  readonly isCustom: true;
  readonly isGroup?: false;
  readonly model: DataMenuCustomModel | JSX.Element;
};

export type DataMenuProcessedDatum<M extends DataMenuModel> =
  DataMenuProcessedCustom | DataMenuProcessedGroup<M> | DataMenuProcessedModel<M>;

export type DataMenuProcessedData<M extends DataMenuModel> = DataMenuProcessedDatum<M>[];

export type DataMenuFlattenedProcessedData<M extends DataMenuModel> = (
  DataMenuProcessedCustom | DataMenuProcessedModel<M>
)[];
