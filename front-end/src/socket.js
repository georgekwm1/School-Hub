import { io } from 'socket.io-client';
import { DOMAIN } from './utils/constants';

let socket = null;

export const connectSocket = (token) => {
	if (!socket) {
		socket = io(DOMAIN, {
			auth: {
				token,
			},
		});
	}

	return new Promise((resolve, reject) => {
		let onError;
		let onConnect;
    onError = (error) => {
      socket.off('connect', onConnect);
      reject(error);
    };

    onConnect = () => {
      socket.off('connect_error', onError);
      resolve(socket);
    };

    socket.once('connect', onConnect);
    socket.once('connect_error', onError);
  });
}

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}

export const getSocket = () => socket;
