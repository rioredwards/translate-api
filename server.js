const express = require("express");
const { Translate } = require("@google-cloud/translate").v2;
const cors = require("cors");

const app = express();
const translate = new Translate();

const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

async function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Translate server is listening on port ${PORT}`);
  });
}

async function translateText(text, target) {
  let [translations] = await translate.translate(text, target);
  return translations;
}

app.use(express.static("public"));

app.post("/", express.json(), async (req, res) => {
  const text = req.body.text;
  const language = req.body.language;

  try {
    const translateRes = await translateText(text, language);
    res.json(translateRes);
  } catch (error) {
    const status = error.code || 500;
    res.status(status).send(error.message);
  }
});

startServer();
