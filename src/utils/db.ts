import Database from 'better-sqlite3';
export const db = new Database('giveaway.db');
db.pragma('journal_mode = WAL');


db.exec(`CREATE TABLE IF NOT EXISTS entries(message_id, user_id)`);
db.exec(`CREATE TABLE IF NOT EXISTS giveaway_message(message_id, start_timestamp, end_time, host_id, item, ended DEFAULT 0)`)