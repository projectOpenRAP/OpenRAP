import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'

import './index.css';
import App from './App';
import reducers from './reducers'

const store = createStore(reducers,{}, applyMiddleware(reduxThunk))

const authData = JSON.parse(localStorage.getItem('authData'));
const configData = JSON.parse(localStorage.getItem('configData'));
const directoryData = localStorage.getItem('directoryData');

if (authData && configData) {
    store.dispatch({ type : 'ENABLE_AUTH', payload : authData })
    store.dispatch({ type : 'CONFIG_FETCH', payload : configData });
    store.dispatch({ type : 'OPEN_DIR', payload : directoryData });
} else {
    store.dispatch({ type: 'DISABLE_AUTH' })
}

ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>
        , document.getElementById('root'));
