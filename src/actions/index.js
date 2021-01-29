import * as types from './ActionTypes';

export function login_success(info){
  return {
    type : types.LOGIN_SUCCESS,
    user_info : info,
  }
}

export function login_failed(){
  return {
    type : types.LOGIN_FAILED
  };
}

export function register_success(info){
  return {
    type : types.REGISTER_SUCCESS,
    user_info : info,
  };
}

export function game_started(game_name, roomID, user_list){
  return {
    type : types.GAME_STARTED,
    game_name : game_name,
    roomID : roomID,
    user_list : user_list,
  }
}

export function game_ended(){
  return{
    type : types.GAME_ENDED,
  }
}

export function admin_func(func_num, sub_num, target_id){
  return{
    type : types.ADMIN_FUNC,
    func_num : func_num,
    sub_num : sub_num,
    target_id : target_id,
  }
}

export function admin_mode(){
  return{
    type : types.ADMIN_MODE
  }
}
