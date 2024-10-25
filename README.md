Family Country Tracking Web Application
--------

This application is a simple web-based tool for tracking visited countries and managing users. 
It is built with Node.js, Express, PostgreSQL, and EJS for templating.

Features
--------
- Track the countries visited by each user.
- Display user information such as name and favorite color.
- Add new users and countries.
- Display all users and their visited countries.

Setup
--------

npm install

Create a PostgreSQL database on dbConfig.js and export this file to index.js (e.g., world).

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "yourpassword",
  port: 5432,
});

Run the SQL script (create necessary tables if not set up) in your PostgreSQL console:

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  color VARCHAR(50)
);

CREATE TABLE visited_countries (
  user_id INTEGER REFERENCES users(id),
  country_code VARCHAR(3),
  PRIMARY KEY (user_id, country_code)
);

CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  country_name VARCHAR(100),
  country_code VARCHAR(3) UNIQUE
);




