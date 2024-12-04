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

	return socket;
}

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}

export const getSocket = () => socket;
