import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsSocketReady } from '../redux/selectors/uiSelectors';

import { getToken } from '../utils/utilFunctions';
import { connectSocket, disconnectSocket, getSocket } from '../socket';
import { setSocketReadiness } from '../redux/actions/uiActionCreators';

export default function useConnectSocket() {
	const isLoggedIn = useSelector((state) => state.ui.get('isLoggedIn'));
  const token = getToken('accessToken');
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && isLoggedIn) {
      connectSocket(token)
      .then(() => dispatch(setSocketReadiness(true)))
      .catch((error) => {
        console.error('Error connecting the socket ' + error);
        setSocketReadiness(false);
      });
    } else {
			disconnectSocket();
			dispatch(setSocketReadiness(false));
    }
  }, [dispatch, token, isLoggedIn]);
}

export function useJoinRoom(room) {
  const isSocketReady = useSelector(selectIsSocketReady);
  const socket = getSocket();

  useEffect(() => {
    if (socket && room) {
      socket.emit('joinRoom', room);
      return () => {
        socket.emit('leaveRoom', room);
      }
    }
  }, [socket, room, isSocketReady]);
}
