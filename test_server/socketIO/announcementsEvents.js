module.exports  = (io) => {
	io.on('connect', (socket) => {
		socket.on('join-announcements-room', (courseId) => {
			const roomName = `announcements-${courseId}`;
			socket.join(roomName);
		});

		socket.on('leave-announcements-room', (courseId) => {
			const roomName = `announcements-${courseId}`;
			socket.leave(roomName);
		});
	})
}
