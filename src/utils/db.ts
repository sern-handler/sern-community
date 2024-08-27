import Database from 'better-sqlite3';
export const db = new Database('giveaway.db');
db.pragma('journal_mode = WAL');


db.exec(`CREATE TABLE IF NOT EXISTS entrees(timestamp, user_id)`);