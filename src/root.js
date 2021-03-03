import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import {CookiesProvider} from 'react-cookie'

const Root = () => (
    <BrowserRouter>
      <CookiesProvider>
        <App/>
      </CookiesProvider>
    </BrowserRouter>
);

export default Root;
