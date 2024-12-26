const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
})

module.exports = {
	query: async (query, params) => {
		const [results] = await pool.query(query, params);
		return results;
	},

	execute: async (query, params) => {
		const [results] = await pool.execute(query, params);
		return results;
	},
	pool,
	transaction: async (callback) => {
		const connection = await pool.getConnection();
		try {
			await connection.beginTransaction();
			const result = await callback(connection);
			await connection.commit();
			return result;
		} catch (error) {
			await connection.rollback();
			throw error;
		} finally {
			connection.release();
		}
	},
}
