import * as types from '../actions/ActionTypes';

const initialState = {
    is_admin : false,
    func_num : 1,
    sub_num : 1,
    target_id : null,
};


export default function admin(state = initialState, action){ //초기화
  switch(action.type){
    case types.ADMIN_FUNC:
      return { ...state,
          func_num : action.func_num,
          sub_num : action.sub_num,
          target_id : action.target_id
        };
    case types.ADMIN_MODE:
      return { ...state,
          is_admin : !state.is_admin
      }
    default :
      return initialState;
  }
}
