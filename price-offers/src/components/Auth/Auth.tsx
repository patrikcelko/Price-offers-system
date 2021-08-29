import { Tab, Tabs } from '@material-ui/core';
import React from 'react';
import './Auth.css';
import Register from '../Register/Register';
import { ITabPanelProps } from '../../models/interfaces';

const TabPanel = ({ children, value, index }: ITabPanelProps) => (
  <div
    hidden={value !== index}
    className="auth-box__tab"
  >
    {children}
  </div>
);

const Auth = () => {
  const [tab, setTab] = React.useState(0);
  const handleChange = (_event: object, newTab: React.SetStateAction<number>) => {
    setTab(newTab);
  };

  return (
    <div className="auth-box">
      <div className="auth-box__header">
        <Tabs
          value={tab}
          className=".auth-box__tabs"
          onChange={handleChange}
          aria-label="Navigation menu"
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
      </div>
      <TabPanel value={tab} index={0}>
        <Register login={false} setAuthTab={setTab} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Register login setAuthTab={setTab} />
      </TabPanel>
    </div>
  );
};

export default Auth;
