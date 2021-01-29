import * as types from '../actions/ActionTypes';

const initialState = {
  is_logined : false,
  user_info : {
    name : null,
  },
};


export default function login(state = initialState, action){ //초기화
  switch(action.type){
    case types.LOGIN_SUCCESS :
      return { ...state,
          is_logined : true,
          user_info : action.user_info
      }
    case types.REGISTER_SUCCESS:
      return { ...state,
          is_logined : true,
          user_info : action.user_info
        };
    case types.LOGIN_FAILED:
      return initialState;
    default :
      return state;
  }
}
