import {combineReducers} from 'redux';
import login from './login';
import game from './game';
import admin from './admin';

const reducers = combineReducers({    //하나로 합치기
    login, game, admin
});

export default reducers;
