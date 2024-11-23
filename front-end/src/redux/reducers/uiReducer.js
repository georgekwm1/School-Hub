import { fromJS, Map } from 'immutable';
import * as actions from '../actions/uiActionTypes';
import { getToken } from '../../utils/utilFunctions';

export const initialState = fromJS({
  isLoading: false,
  // this is being done only temporarily for dev ease
  // utill we get to the time of persesting data
  // because anyway.. doing this will cause a ton of problems
  // because user data and role and so on is not in the state
  // so when needed. i'll have to logout and login manually
  isLoggedIn: getToken('accessToken') ? true : false,
  course: {
    id: 3,
  },
  user: {},
  // Save different error messages for different error types
  error: {
    auth: '',
  },
});

export default function uiReducer(state = initialState, action = {}) {
  switch (action.type) {
    case actions.SET_ERROR: {
      const { errorType, errorMessage } = action.payload;
      return state.setIn(['error', errorType], errorMessage);
    }

    case actions.CLEAR_ERROR: {
      const { errorType } = action.payload;
      return state.setIn(['error', errorType], '');
    }

    case actions.TOGGLE_LOADING: {
      return state.set('isLoading', !state.get('isLoading'));
    }

    case actions.LOGIN_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.LOGIN_SUCCESS: {
      const user = Map(action.payload.user);

      return state.withMutations((mutableState) => {
        return mutableState
          .set('isLoading', false)
          .set('isLoggedIn', true)
          .set('user', Map(user))
          .setIn(['error', 'auth'], '');
      });
    }

    case actions.LOGOUT: {
      return state.withMutations((mutableState) => {
        return mutableState
          .set('isLoading', false)
          .set('isLoggedIn', false)
          .set('user', {})
          .setIn(['error', 'auth'], '');
      });
    }

    case actions.REGISTER_REQUEST: {
      return state.set('isLoading', true);
    }

    case actions.REGISTER_FAILURE: {
      const { errorMessage } = action.payload;
      return state.withMutations((mutableState) => {
        return mutableState
          .set('isLoading', false)
          .setIn(['error', 'auth'], errorMessage);
      });
    }

    case actions.REGISTER_SUCCESS: {
      return state.withMutations((mutableState) => {
        return mutableState
          .set('isLoading', false)
          .setIn(['error', 'auth'], '')
          .set('isLoggedIn', true)
          .set('user', action.payload.user);
      });
    }

    default: {
      return state;
    }
  }
}
