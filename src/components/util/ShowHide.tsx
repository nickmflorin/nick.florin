import { type JSX, memo, type ReactNode } from 'react';

type ShowProps = {
  readonly children: ReactNode;
  readonly show: boolean;
};

type HideProps = {
  readonly children: ReactNode;
  readonly hide: boolean;
};

type ShowHideProps = HideProps | ShowProps;

const isShowProps = (props: ShowHideProps): props is ShowProps => 'show' in props;

const _ShowHide = (props: ShowHideProps): JSX.Element | null =>
  isShowProps(props) ? (
    props.show === true ? (
      <>{props.children}</>
    ) : null
  ) : props.hide === true ? null : (
    <>{props.children}</>
  );

export const ShowHide = memo(_ShowHide);
