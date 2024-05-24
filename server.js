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

app.get("/", async (_, res) => {
  const greeting = `Hello from the Translate API! 👋
    You sent a GET request, but you will need to send a POST request to use this API.

    Please send a POST request that includes some text to translate and language to translate to in the body of the request. 

    Your fetch should look like this: 
    fetch(INSERT_URL_HERE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: INSERT_TEXT_HERE,
        language: INSERT_LANGUAGE_HERE,
      }),
    })`;
  res.send(greeting);
});

app.post("/", express.json(), async (req, res) => {
  const text = req.body.text;
  const language = req.body.language;

  try {
    const translateRes = await translateText(text, language);
    res.send(translateRes);
  } catch (error) {
    const status = error.code || 500;
    res.status(status).send(error.message);
  }
});

startServer();
