import Database from 'better-sqlite3';
export const db = new Database('giveaway.db');
db.pragma('journal_mode = WAL');


db.exec(`CREATE TABLE IF NOT EXISTS entries(timestamp, user_id)`);
db.exec(`CREATE TABLE IF NOT EXISTS giveaway_message(message_id)`)