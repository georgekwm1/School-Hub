const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
})

/**
 * Plucks a single key from an array of objects.
 * @param {Object[]} rows - The array of objects to pluck from.
 * @returns {any[]} - An array of the values of the plucked key.
 * @throws {TypeError} - If the rows are not an array.
 * @throws {Error} - If the rows are empty.
 * @throws {Error} - If the rows have more than one key.
 */
const pluck = (rows) => {
	if (!Array.isArray(rows)) throw new TypeError('Rows must be an array');
	if (rows.length === 0) return [];
	if (Object.keys(rows[0]).length !== 1) throw new ValueError('Rows must have only one key');

	const key = Object.keys(rows[0])[0];
	return rows.map((row) => row[key]);
}

module.exports = {
	query: async (query, params, pluck=false) => {
		const [results] = await pool.query(query, params);
		return pluck ? pluck(results) : results;
	},

	execute: async (query, params, pluck=false) => {
		const [results] = await pool.execute(query, params);
		return pluck ? pluck(results) : results;
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
