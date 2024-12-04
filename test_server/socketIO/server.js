module.exports = (io) => {
	io.on('connection', (socket) => {
		console.log(`New socker connected ${socket.id}`);
	});
} 
