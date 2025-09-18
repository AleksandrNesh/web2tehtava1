let data = [
  { id: 1, firstName: "Matti", lastName: "Ruohonen" },
  { id: 2, firstName: "Teppo", lastName: "Ruohonen" },
];
let dictionary = [];
const express = require("express");
const fs = require("fs");
//const bodyParser = require("body-parser");
/* const app = express().use(bodyParser.json()); //vanha tapa - ei enää voimassa. 
kts. https://devdocs.io/express/ -> req.body*/
var app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

/*CORS isn't enabled on the server, this is due to security reasons by default,
so no one else but the webserver itself can make requests to the server.*/
// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  res.setHeader("Content-type", "application/json");

  // Pass to next layer of middleware
  next();
});

// GET /search?word=... - haku query parametrilla
app.get("/search", (req, res) => {
  const finnishWord = req.query.word;

  // Luetaan sanakirja.txt -tiedoston sisältö synkronisesti (UTF-8 merkistökoodaus)
  const fileContent = fs.readFileSync("./sanakirja.txt", "utf8");
  const lines = fileContent.split(/\r?\n/);

  // Käydään jokainen rivi läpi
  for (const line of lines) {
    // Erotellaan rivin sanat välilyönnin kohdalta
    // (ensimmäinen suomenkielinen sana, toinen englanninkielinen sana)
    const [finWord, engWord] = line.split(" ");
    if (finnishWord === finWord) {
      //return res.json({ engWord });
      return res.send(engWord);
    }
  }

  // kun sanaa ei löydy
  res.json({ message: "Sanaa ei löydy" });
});

// POST /words - lisää uusi sana sanakirjaan
app.post("/words", (req, res) => {
  // Saadaan data pyynnön bodysta
  const wordPair = req.body;

  // Muodostetaan uusi rivi tiedostoon
  const newLine = `${wordPair.finnish} ${wordPair.english}\n`;

  // Lisätään rivi tiedoston loppuun
  fs.appendFileSync("./sanakirja.txt", newLine);

  // Lähetetään takaisin lisätyt data
  res.json({
    message: "Sana lisätty onnistuneesti",
    lisatty: wordPair,
  });
});

// GET all words
app.get("/words", (req, res) => {
  const data = fs.readFileSync("./sanakirja.txt", {
    encoding: "utf8",
    flag: "r",
  });
  //data:ssa on nyt koko tiedoston sisältö
  /*tiedoston sisältö pitää pätkiä ja tehdä taulukko*/
  const splitLines = data.split(/\r?\n/);
  /*Tässä voisi käydä silmukassa läpi splitLines:ssa jokaisen rivin*/
  splitLines.forEach((line) => {
    const words = line.split(" "); //sanat taulukkoon words
    console.log(words);
    const word = {
      fin: words[0],
      eng: words[1],
    };
    dictionary.push(word);
    console.log(dictionary);
  });

  res.json(dictionary);
});

// GET a user
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = data.find((user) => user.id === id);
  res.json(user ? user : { message: "Not found" });
});

// ADD a user
app.post("/users", (req, res) => {
  const user = req.body;
  data.push(user);
  res.json(data);
});

// UPDATE a user
app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const updatedUser = req.body;
  data = data.map((user) => (user.id === id ? updatedUser : user));
  res.json(data);
});

// DELETE a user
app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  data = data.filter((user) => user.id !== id);
  res.json(data);
});

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
