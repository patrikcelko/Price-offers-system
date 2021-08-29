import React from 'react';
import {
  BrowserRouter, Redirect, Switch, Route,
} from 'react-router-dom';
import useSWR from 'swr';
import Cookies from 'universal-cookie';
import { useRecoilState } from 'recoil';
import Auth from './components/Auth/Auth';
import Header from './components/Header/Header';
import Companies from './components/tables/Companies/Companies';
import Demands from './components/tables/Demands/Demands';
import Negotiations from './components/tables/Negotiations/Negotiations';

import './App.css';
import WarningSnackBar from './components/Snackbar/Snackbar';
import { userState, warningState } from './store/atom';
import { ESeveritySnackBar } from './models/interfaces';

const App = () => {
  const cookies = new Cookies();
  const token = cookies.get('token');
  const [user, setUser] = useRecoilState(userState);
  const [state, setState] = useRecoilState(warningState);

  const loggedIn = user !== null;

  const fetcher = (url: string, fetcherToken: string) => fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${fetcherToken}`,
    },
  }).then(async (res) => {
    const result = await res.json();
    if ('desc' in result) {
      setUser(null);
      return;
    }
    setUser({
      name: result?.name,
      uuid: result?.uuid,
      email: result?.email,
      token: fetcherToken,
    });
  });

  const { data } = useSWR(['/user', token], fetcher);

  if (!data) {
    if (!state) {
      setState({
        isEnabled: true,
        description: 'Loading user data',
        severity: ESeveritySnackBar.INFO,
      });
    }
  }
  return (
    <BrowserRouter>
      <WarningSnackBar />
      <Header loggedIn={loggedIn} />
      {(!loggedIn) ? <Auth /> : null}
      {(loggedIn) ? (
        <main className="content">
          <Switch>
            <Route path="/demands" render={() => (loggedIn ? <Demands /> : null)} />
            <Route path="/negotiations" render={() => (loggedIn ? <Negotiations /> : null)} />
            <Route path="/companies" render={() => (loggedIn ? <Companies /> : null)} />
          </Switch>
        </main>
      ) : null}
      <Redirect from="*" to="/demands" />
    </BrowserRouter>
  );
};

export default App;
