const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
  );
`;

pool
  .connect()
  .then((client) => {
    return client
      .query(createTableQuery)
      .then(() => {
        console.log("Table 'items' created or already exists.");
        client.release();
      })
      .catch((err) => {
        console.error("Error creating table:", err);
        client.release();
      });
  })
  .catch((err) => console.error("Error connecting to PostgreSQL:", err));

app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/items", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send("Name is required");
  }

  try {
    const result = await pool.query(
      "INSERT INTO items (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
