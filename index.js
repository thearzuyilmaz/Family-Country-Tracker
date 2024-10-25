import express from "express";
import bodyParser from "body-parser";
import pool from "./dbConfig.js";  // Import the pool configuration


const app = express();
const port = 3000;


pool.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;


async function checkUsers() {
  const result = await pool.query("SELECT * FROM users");

  // Use map to create a new array of user objects
  const users = result.rows.map(user => ({
    id: user.id,
    name: user.name,
    color: user.color
  }));

  return users;
}

async function checkUserDetailsByUserID(currentUserId) {
  const result = await pool.query(
    "SELECT name, color FROM users WHERE id = $1",
    [currentUserId]
  );

  const userDetails = result.rows.map((user) => ({
    name: user.name, 
    color: user.color
  }));

  return userDetails;

}


async function checkCountriesByUserId(userID) {
  // Query for the countries visited by the specific user_id
  const result = await pool.query(
    "SELECT country_code FROM visited_countries WHERE user_id = $1", 
    [userID]  // Use parameterized query to avoid SQL injection
  );

  const visited_country_codes = result.rows.map(row => row.country_code);

  return visited_country_codes;
}


app.get("/", async (req, res) => {


  let users = await checkUsers(); // all users
  let visited_country_codes = await checkCountriesByUserId(currentUserId); 
  let userDetails = await checkUserDetailsByUserID(currentUserId); 
  // console.log(userDetails[0].color);

  res.render("index.ejs", {
    countries: visited_country_codes,
    total: visited_country_codes.length,
    users: users,
    color: userDetails[0].color,
  });
});

app.post("/user", (req, res) => {

  try {

    if (req.body.add === "new") {
      return res.render("new.ejs"); 
  
    } else {
      currentUserId = req.body.user; 
      return res.redirect("/");
    }
    
  } catch (err) {
    res.render("index.ejs", {error: err});
  
  }

});

app.post("/add", async (req, res) => {

  const input = req.body["country"];

  try {
    const result = await pool.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const countryCode = result.rows[0].country_code;


    try {
      await pool.query(
        "INSERT INTO visited_countries (user_id, country_code) VALUES ($1, $2)",
        [currentUserId, countryCode]
      );
      res.redirect("/");
    } catch (err) {
      res.render("index.ejs", {error: err});
    }
  } catch (err) {
    res.render("index.ejs", {error: err});
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html

  const inputName = req.body.name;
  const inputColor = req.body.color;

  try {

    const result = await pool.query("INSERT INTO users (name, color) VALUES ($1, $2) RETURNING id",
    [inputName, inputColor]  
    );

    // console.log(result.rows);

    // Extract the user ID
    const userID = result.rows[0].id;
    currentUserId = userID;
    res.redirect("/");
    
  } catch (err) {
    res.render("index.ejs", {error: err});
  }

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
