import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import App from './App';
import './index.css';

// eslint-disable-next-line
console.error = () => { };
// eslint-disable-next-line
console.log = () => { };
// eslint-disable-next-line
console.warn = () => { };

ReactDOM.render(
  <RecoilRoot><App /></RecoilRoot>,
  document.getElementById('root'),
);
