const jwt = require('jsonwebtoken');

module.exports = (io) => {
	function authMiddleware(socket, next) {
		const token = socket.handshake.auth.token;
		if (!token) {
			next(new Error('No token provided'));
		}

		try {
			const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
			socket.userId = payload.userId;
			next();
		} catch (error) {
			next(new Error('Invalid token'));
		}
	}

	io.use(authMiddleware);

	io.on('connection', (socket) => {
		console.log(`Socket connected: ${socket.id} with userId: ${socket.userId}`);

		const userRoom = `user-${socket.userId}`;
		socket.join(userRoom);

		socket.on('joinRoom', (room) => {
			socket.join(room);
		})

		socket.on('leaveRoom', (room) => {
			socket.leave(room);
		})
		
		socket.on('disconnect', (reason) => {
			console.log(`Socket ${socket.id} disconnected due to ${reason}`);
		});
	});
} 
