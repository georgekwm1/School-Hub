const db = require('better-sqlite3')('./db.sqlite');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');



async function insertAdmin(){
	const insertAdmin = db.prepare(
		`INSERT INTO users (
			id, email, passwordHash, firstName, lastName, username, role, pictureId,
			pictureUrl, pictureThumbnail)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	);
	
	const id = uuidv4();
	const passwordHash = await bcrypt.hash("admin", 10);
	
	insertAdmin.run(
		id,
		// I'm testing here OK? Don't do that ever
		'admin',
		passwordHash,
		'Mr,',
		'Admin',
		'admin',
		'admin',
		'',
		'https://picsum.photos/100',
		'https://picsum.photos/100',
	);
}
insertAdmin();
