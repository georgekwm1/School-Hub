import { fromJS, Map } from 'immutable';
import * as actions from '../actions/uiActionTypes';

export const initialState = fromJS({
  isLoading: false,
  isLoggedIn: false,
  isSocketReady: false,
  course: {
    id: process.env.REACT_APP_COURSE_ID,
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

    case actions.SET_SOCKET_READINESS: {
      return state.set('isSocketReady', action.payload.status);
    }

    default: {
      return state;
    }
  }
}
