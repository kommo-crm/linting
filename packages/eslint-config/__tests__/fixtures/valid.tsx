import { type FC, type ReactElement } from 'react';

interface Props {
  /**
   * Visibility flag.
   */
  isVisible: boolean;
  /**
   * Render the child element instead of the default wrapper.
   */
  asChild?: boolean;
  /**
   * Rendered entries.
   */
  items: string[];
}

export const Widget: FC<Props> = (props): ReactElement => {
  const { isVisible, asChild = false, items } = props;
  const Comp = asChild ? 'span' : 'div';

  return (
    <Comp>
      {isVisible ? <span /> : null}
      {Boolean(items.length) && <span />}
    </Comp>
  );
};
