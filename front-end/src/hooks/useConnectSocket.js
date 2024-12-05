import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getToken } from '../utils/utilFunctions';
import { connectSocket, disconnectSocket } from '../socket';
import { setSocketReadiness } from '../redux/actions/uiActionCreators';

export default function useConnectSocket() {
	const isLoggedIn = useSelector((state) => state.ui.get('isLoggedIn'));
  const token = getToken('accessToken');
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && isLoggedIn) {
      connectSocket(token);
			dispatch(setSocketReadiness(true));
    } else {
			disconnectSocket();
			dispatch(setSocketReadiness(false));
    }
  }, [token, isLoggedIn]);
}
