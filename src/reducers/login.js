import * as types from '../actions/ActionTypes';

const initialState = {
  is_logined : false,
  is_guest : false,
  user_info : {
    nickname : null,
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
    case types.GUEST_MODE:
      return { ...state,
        is_guest : true,
        user_info : action.user_info,
      };
    default :
      return state;
  }
}
