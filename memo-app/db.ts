import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./memo.db");

db.run(`
  CREATE TABLE IF NOT EXISTS memos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  )
`);

export default db;
import { Memo } from "./types.js";

export const getAllMemos = (): Promise<Memo[]> => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM memos", (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Memo[]);
    });
  });
};