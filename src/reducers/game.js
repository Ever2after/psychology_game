import * as types from '../actions/ActionTypes';

const initialState = {
    game_started : false,
    game_name : "",
};


export default function game(state = initialState, action){ //초기화
  switch(action.type){
    case types.GAME_STARTED:
      return { ...state,
          game_started : true,
          game_name : action.game_name
        };
    case types.GAME_ENDED:
      return { ...state,
          game_started : false,
          game_name : ""
      }
    default :
      return initialState;
  }
}
