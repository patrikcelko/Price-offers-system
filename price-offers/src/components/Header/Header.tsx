import {
  Tab, Tabs, Drawer, useMediaQuery,
} from '@material-ui/core';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import './Header.css';
import { useRecoilValue } from 'recoil';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import BarChartIcon from '@material-ui/icons/BarChart';
import BusinessIcon from '@material-ui/icons/Business';
import ForumIcon from '@material-ui/icons/Forum';
import { IHeaderProps } from '../../models/interfaces';
import { menuState, userState } from '../../store/atom';
import UserMenu from '../UserMenu/UserMenu';
import Notifications from '../Notifications/Notifications';
import companyLogo from '../../assets/images/euro.svg';

const Header = ({ loggedIn }: IHeaderProps) => {
  const location = useLocation();
  const [drawer, setDrawer] = React.useState(false);
  const menu = useRecoilValue(menuState);
  const user = useRecoilValue(userState);
  const mobile = useMediaQuery('(max-width:1000px)');

  const toggleDrawer = (_event: any) => {
    if (_event?.target?.innerText === 'Edit profile' || menu.isOpened) {
      return;
    }
    setDrawer(!drawer);
  };

  if (drawer && !menu.isOpened && user === null) {
    setDrawer(false);
  }

  const menuButton = loggedIn ? (
    <>
      <Notifications />
      <IconButton onClick={toggleDrawer} className="header__user-button" aria-label="Menu">
        {(!mobile) ? <AccountCircleIcon /> : <MenuIcon />}
      </IconButton>
    </>
  ) : null;

  const paths = ['/demands', '/negotiations', '/companies'];

  const tabs = loggedIn ? (
    <>
      <Tabs
        className="header__tabs"
        value={(paths.includes(location.pathname)) ? (location.pathname) : false}
        aria-label="Navigation menu"
        variant="scrollable"
      >
        <Tab
          label={(
            <>
              <div className="header__tabs__icon-and-text">
                <BarChartIcon className="header__tabs__icon-and-text__icon-demands" />
                Demands
              </div>
            </>
          )}
          value="/demands"
          component={Link}
          to="/demands"
        />
        <Tab
          label={(
            <>
              <div className="header__tabs__icon-and-text">
                <ForumIcon className="header__tabs__icon-and-text__icon-negot" />
                Negotiations
              </div>
            </>
          )}
          value="/negotiations"
          component={Link}
          to="/negotiations"
        />
        <Tab
          label={(
            <>
              <div className="header__tabs__icon-and-text">
                <BusinessIcon className="header__tabs__icon-and-text__icon-companies" />
                Companies
              </div>
            </>
          )}
          value="/companies"
          component={Link}
          to="/companies"
        />
      </Tabs>
    </>

  ) : null;

  return (
    <>
      <div className="header">
        <Link to="/demands" className="header__logo-link">
          <img className="header__company-logo" src={companyLogo} alt="Company logo" />
          <div className="header__title">Price Offers</div>
        </Link>
        {tabs}
        {menuButton}
        <Drawer className="header__drawer" onClick={toggleDrawer} anchor="right" open={drawer}>
          <UserMenu />
        </Drawer>
      </div>
    </>
  );
};

export default Header;
