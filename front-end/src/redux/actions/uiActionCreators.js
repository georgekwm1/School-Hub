import { googleLogout } from '@react-oauth/google';
import toast from 'react-hot-toast';
import * as actions from './uiActionTypes';
import { DOMAIN } from '../../utils/constants';
import { getToken, removeToken, setToken } from '../../utils/utilFunctions';

export const toggleLoading = () => {
  return { type: actions.TOGGLE_LOADING };
};

export const loginRequest = () => {
  return { type: actions.LOGIN_REQUEST };
};

export const loginSuccess = (user) => {
  return {
    type: actions.LOGIN_SUCCESS,
    payload: {
      user,
    },
  };
};

export const loginFailure = (errorMessage) => (dispatch) => {
  dispatch(setError('auth', errorMessage));
  dispatch(toggleLoading());
};

export function formLogin(email, password, isAdmin) {
  const url = isAdmin
    ? `${DOMAIN}/auth/admin/login`
    : `${DOMAIN}/api/login`
  const request = new Request(url, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return login(request);
}

export function googleLogin(idToken, isAdmin) {
  const url = isAdmin
    ? `${DOMAIN}/auth/admin/oauth/google/`
    : `${DOMAIN}/auth/oauth/google`
  const request = new Request(url, {
    method: 'POST',
    body: JSON.stringify({ token: idToken }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return login(request);
}

const login = (request) => async (dispatch) => {
  dispatch(loginRequest());

  try {
    const response = await fetch(request);
    if (!response.ok) {
      switch (response.status) {
        case 401: {
          throw new Error('Please.. check again the email or the password!');
        }
        case 404: {
          throw new Error("Oops, that's a 404!");
        }
        default: {
          throw new Error('Unexpected error occured!');
        }
      }
    }

    const data = await response.json();

    setToken('refreshToken', data.refresh);
    setToken('accessToken', data.access);

    const userData = {
      ...data.user,
      id: data.user.user_id,
    }
    dispatch(loginSuccess(userData));
  } catch (error) {
    dispatch(loginFailure(error.message));
    console.error(error.message);
  }
};

// TODO: move ui thunks to a file alone like other reducers
// and change routes acordingly
export const logoutThunk = () => async (dispatch) => {
  await fetch(`${DOMAIN}/api/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken('accessToken')}`,
    },
  }).catch(error => {
    console.error(error);
    toast.error('Server failure while logging out!');
    dispatch(setError('auth', error.message))
  });
  googleLogout();
  dispatch(logout());
  removeToken('accessToken');
  removeToken('refreshToken');
}

export const logout = () => {
  return {
    type: actions.LOGOUT,
  };
};
export const setError = (errorType, errorMessage) => {
  return {
    type: actions.SET_ERROR,
    payload: {
      errorType,
      errorMessage,
    },
  };
};

export const clearError = (errorType) => {
  return {
    type: actions.CLEAR_ERROR,
    payload: { errorType },
  };
};

export const registerRequest = () => {
  return {
    type: actions.REGISTER_REQUEST,
  };
};

export const registerFailure = (errorMessage) => {
  return { type: actions.REGISTER_FAILURE, payload: { errorMessage } };
};

export const registerSuccess = (user) => {
  return {
    type: actions.REGISTER_SUCCESS,
    payload: { user },
  };
};

export const formRegister = (userData) => {
  const request = new Request(`${DOMAIN}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({userData}),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return register(request);
}

export const googleRegister = (idToken) => {
  const request = new Request(`${DOMAIN}/auth/oauth/googleRegister`, {
    method: 'POST',
    body: JSON.stringify({token: idToken}),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return register(request);
}

export const register = (request) => async (dispatch) => {
  dispatch(registerRequest());

  try {
    const response = await fetch(request);
    const data = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 409: {
          const { message } = data
          throw new Error(message);
        }
        case 404: {
          throw new Error("Oops, that's a 404!");
        }
        default: {
          console.error(data);
          throw new Error(`Unexpected ${response.status} error occured!`);
        }
      }
    }
    dispatch(registerSuccess(data.user));

  } catch (error) {
    console.error(error);
    dispatch(registerFailure(error.message));    
  }
};
