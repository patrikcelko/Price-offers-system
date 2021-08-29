import React from 'react';
import { useMediaQuery, ListItem, List } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import { useRecoilState, useResetRecoilState } from 'recoil';
import './UserMenu.css';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Cookies from 'universal-cookie';
import BarChartIcon from '@material-ui/icons/BarChart';
import BusinessIcon from '@material-ui/icons/Business';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ForumIcon from '@material-ui/icons/Forum';
import EditProfile from '../EditProfile/EditProfile';
import { companyState, negotiationState, userState } from '../../store/atom';

const UserMenu = () => {
  const [user, setUser] = useRecoilState(userState);
  const resetCompanies = useResetRecoilState(companyState);
  const resetNegotiations = useResetRecoilState(negotiationState);
  const mobile = useMediaQuery('(max-width:1000px)');

  const logout = (): void => {
    const cookies = new Cookies();
    cookies.remove('token');
    setUser(null);
    resetCompanies();
    resetNegotiations();
  };

  return (
    <>
      <AccountCircleIcon className="user-menu__icon" />
      <div className="user-menu__name">{user?.name}</div>
      <div className="user-menu__email">{user?.email}</div>
      <List>
        <ListItem button key="Log out" onClick={logout}>
          <ExitToAppIcon className="user-menu__link__icon" />
          Log out
        </ListItem>
        <EditProfile logout={logout} />
        {(mobile)
          ? (
            <>
              <hr />
              <NavLink activeClassName="user-menu__link_active" className="user-menu__link" to="/demands">
                <ListItem button key="Demands">
                  <BarChartIcon className="user-menu__link__icon" />
                  Demands
                </ListItem>
              </NavLink>
              <NavLink activeClassName="user-menu__link_active" className="user-menu__link" to="/negotiations">
                <ListItem button key="Negotiations">
                  <ForumIcon className="user-menu__link__icon" />
                  Negotiations
                </ListItem>
              </NavLink>
              <NavLink activeClassName="user-menu__link_active" className="user-menu__link" to="/companies">
                <ListItem button key="Companies">
                  <BusinessIcon className="user-menu__link__icon" />
                  Companies
                </ListItem>
              </NavLink>
            </>
          ) : null}
      </List>
    </>
  );
};

export default UserMenu;
