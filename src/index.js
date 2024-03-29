import React from 'react';
import ReactDOM from 'react-dom';
import Root from './root';

import {createStore} from 'redux';
import reducers from './reducers';
import {Provider} from 'react-redux';

const store = createStore(reducers,
window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Root/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
