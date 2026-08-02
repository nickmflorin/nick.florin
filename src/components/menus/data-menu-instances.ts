import {
  type BaseDataMenuModel,
  type DataMenuCustomModel,
  type DataMenuCustomModelRefKey,
  type DataMenuModel,
  type DataMenuModelRefKey,
  type DataMenuOptions,
} from './data-menu-models';
import {
  type ConnectedMenuItemInstance,
  type DisconnectedMenuItemInstance,
  type MenuItemInstance,
} from './menu-item-instances';

/* -------------------------- Data Menu Item Instance Management -------------------------------*/
export type DataMenuItemInstances<
  M extends BaseDataMenuModel,
  O extends DataMenuOptions<M>,
> = Record<DataMenuCustomModelRefKey | DataMenuModelRefKey<M, O>, MenuItemInstance>;

export type DataMenuItemInstanceLookupArg<M extends DataMenuModel, O extends DataMenuOptions<M>> =
  DataMenuCustomModel | DataMenuCustomModelRefKey | DataMenuModelRefKey<M, O> | M;

export const menuItemInstanceLookupArgIsModel = <
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
>(
  arg: DataMenuItemInstanceLookupArg<M, O>,
): arg is DataMenuCustomModel | M => typeof arg !== 'string' && typeof arg !== 'number';

export type CreateDataMenuItemInstanceOptions = {
  readonly strict?: boolean;
};

export type CreateDataMenuItemInstanceRT<O extends CreateDataMenuItemInstanceOptions> = O extends {
  strict: true;
}
  ? DisconnectedMenuItemInstance
  : DisconnectedMenuItemInstance | null;

export type MenuModelInstancesManagerGetKeyRT<
  A extends DataMenuItemInstanceLookupArg<M, O>,
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
> = A extends DataMenuCustomModel | DataMenuCustomModelRefKey
  ? DataMenuCustomModelRefKey
  : DataMenuModelRefKey<M, O>;

export interface MenuModelInstancesManager<
  M extends BaseDataMenuModel,
  O extends DataMenuOptions<M>,
> {
  readonly connect: (
    m: DataMenuItemInstanceLookupArg<M, O>,
    instance: ConnectedMenuItemInstance,
  ) => void;
  readonly create: <CO extends CreateDataMenuItemInstanceOptions>(
    k: DataMenuItemInstanceLookupArg<M, O>,
    opts?: CO,
  ) => CreateDataMenuItemInstanceRT<CO>;
  readonly createIfNecessary: (
    k: DataMenuItemInstanceLookupArg<M, O>,
  ) => DisconnectedMenuItemInstance | null;
  readonly exists: (k: DataMenuItemInstanceLookupArg<M, O>) => boolean;
  readonly get: (k: DataMenuItemInstanceLookupArg<M, O>) => MenuItemInstance | null;
  readonly getKey: <A extends DataMenuItemInstanceLookupArg<M, O>>(
    args: A,
  ) => MenuModelInstancesManagerGetKeyRT<A, M, O>;
  readonly getOrCreate: (k: DataMenuItemInstanceLookupArg<M, O>) => MenuItemInstance;
}

/* -------------------------------- Data Menu Instances -------------------------------------*/
export interface DataMenuContentInstance<M extends DataMenuModel, O extends DataMenuOptions<M>> {
  readonly createInstance: <CO extends CreateDataMenuItemInstanceOptions>(
    k: DataMenuItemInstanceLookupArg<M, O>,
    opts?: CO,
  ) => CreateDataMenuItemInstanceRT<CO>;
  readonly createInstanceIfNecessary: (
    m: DataMenuItemInstanceLookupArg<M, O>,
  ) => DisconnectedMenuItemInstance | null;
  readonly decrementNavigatedIndex: () => void;
  readonly focus: () => void;
  readonly getInstance: (m: DataMenuItemInstanceLookupArg<M, O>) => MenuItemInstance | null;
  readonly getOrCreateInstance: (m: DataMenuItemInstanceLookupArg<M, O>) => MenuItemInstance;
  readonly incrementNavigatedIndex: () => void;
}

export type DataMenuInstance<
  M extends DataMenuModel,
  O extends DataMenuOptions<M>,
> = DataMenuContentInstance<M, O>;
