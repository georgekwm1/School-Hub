import * as actions from './uiActionTypes';
import toast from 'react-hot-toast';
import { googleLogout } from '@react-oauth/google';
import { DOMAIN } from '../../utils/constants';
import { setToken, getToken, removeToken } from '../../utils/utilFunctions';

export const toggleLoading = () => {
  return { type: actions.TOGGLE_LOADING };
};

export const setSocketReadiness = (status) => {
  return {
    type: actions.SET_SOCKET_READINESS,
    payload: {
      status,
    }
  }  
}

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

export function formLogin(email, password, courseId, isAdmin) {
  const url = isAdmin
    ? `${DOMAIN}/auth/admin/login`
    : `${DOMAIN}/auth/login`
  const request = new Request(url, {
    method: 'POST',
    body: JSON.stringify({ email, password, courseId }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return login(request);
}

export function googleLogin(idToken, courseId, isAdmin) {
  const url = isAdmin
    ? `${DOMAIN}/auth/admin/oauth/google/`
    : `${DOMAIN}/auth/oauth/google`
  const request = new Request(url, {
    method: 'POST',
    body: JSON.stringify({ token: idToken, courseId }),
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
    const data = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 401: {
          throw new Error(data.message);
        }
        case 404: {
          throw new Error("Oops, that's a 404!");
        }
        default: {
          throw new Error('Unexpected error occured!');
        }
      }
    }
    
    setToken('accessToken', data.accessToken);
    dispatch(loginSuccess(data.user));
  } catch (error) {
    dispatch(loginFailure(error.message));
    console.error(error.message);
  }
};

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

export const formRegister = (userData, courseId) => {
  const request = new Request(`${DOMAIN}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({userData, courseId}),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return register(request);
}

export const googleRegister = (idToken, courseId) => {
  const request = new Request(`${DOMAIN}/auth/oauth/googleRegister`, {
    method: 'POST',
    body: JSON.stringify({token: idToken, courseId}),
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

    setToken('accessToken', data.accessToken);

    dispatch(registerSuccess(data.user));

  } catch (error) {
    console.error(error);
    dispatch(registerFailure(error.message));    
  }
};



export const logoutThunk = () => async (dispatch) => {
  try {
    // I think how I'm handling the error here is questionable!
    await toast.promise(
      fetch(`${DOMAIN}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken('accessToken')}`,
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Failed to log out');
        }
        return response.json();
      }),
      {
        loading: 'Logging out...',
        success: 'Logged out successfully',
        error: 'ServerError logging you out',
      }
    );
  } catch (error) {
    console.error(error.message);
  }
  removeToken('accessToken');
  googleLogout();
  dispatch(logout());
}
