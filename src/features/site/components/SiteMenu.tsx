import { type BrandResume } from '~/database/model';

import { Button } from '~/components/buttons/generic/Button';
import { IconButton } from '~/components/buttons/generic/IconButton';
import { NavMenuAnchor } from '~/components/buttons/NavMenuAnchor';
import { flattenSidebarItems, type ISidebarItem } from '~/components/layout/types';
import { Menu } from '~/components/menus/Menu';

export interface SiteMenuProps {
  readonly nav: ISidebarItem[];
  readonly resume: BrandResume | null;
}

export const SiteMenu = ({ nav, resume }: SiteMenuProps) => (
  <Menu className='site-menu'>
    <Menu.Content className='flex flex-col justify-between gap-[8px]'>
      {nav.length === 0 ? null : (
        <div className='flex flex-col gap-[4px]'>
          {flattenSidebarItems(nav).map((item, index) => (
            <Menu.Item className='p-0' key={index} shouldHighlightOnHover={false}>
              <NavMenuAnchor item={item} />
            </Menu.Item>
          ))}
        </div>
      )}
      {resume ? (
        <Menu.Item
          className='flex flex-row items-center gap-[8px] p-0'
          shouldHighlightOnHover={false}
        >
          <Button.Outlined
            className='grow'
            element='a'
            href={resume.url}
            openInNewTab
            size='medium'
          >
            View Resume
          </Button.Outlined>
          <IconButton.Solid
            element='a'
            href={resume.downloadUrl}
            icon={{ name: 'cloud-arrow-down' }}
            openInNewTab
            scheme='primary'
            size='medium'
          />
        </Menu.Item>
      ) : null}
    </Menu.Content>
  </Menu>
);
