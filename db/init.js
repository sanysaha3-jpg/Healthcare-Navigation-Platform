const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'queueless.db');

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  console.log('🔧 Initializing QueueLess database...');

  db.run(`
    CREATE TABLE User (
      user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      age           INTEGER,
      location      TEXT,
      medical_history TEXT,
      scheme_eligible INTEGER DEFAULT 0,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE Hospital (
      hospital_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      address       TEXT,
      latitude      REAL,
      longitude     REAL
    )
  `);

  db.run(`
    CREATE TABLE Department (
      dept_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id   INTEGER NOT NULL,
      name          TEXT NOT NULL,
      avg_cost      REAL,
      FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id)
    )
  `);

  db.run(`
    CREATE TABLE Doctor (
      doctor_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      dept_id       INTEGER NOT NULL,
      name          TEXT NOT NULL,
      specialization TEXT,
      FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
    )
  `);

  db.run(`
    CREATE TABLE QueueRecord (
      record_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id   INTEGER NOT NULL,
      dept_id       INTEGER NOT NULL,
      timestamp     DATETIME DEFAULT CURRENT_TIMESTAMP,
      queue_count   INTEGER,
      FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id),
      FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
    )
  `);

  db.run(`
    CREATE TABLE Scheme (
      scheme_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      coverage_pct  INTEGER,
      description   TEXT
    )
  `);

  console.log('✅ All tables created: User, Hospital, Department, Doctor, QueueRecord, Scheme');
});

db.close((err) => {
  if (err) console.error(err.message);
  else console.log('💾 Database ready at db/queueless.db\n');
});
