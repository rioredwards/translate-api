const express = require("express");
const cors = require("cors");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const fetch = require("node-fetch");

const app = express();

const PORT = 3000;
const API_KEY = process.env.API_KEY;
const TRANSLATE_URL = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  })
);

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after an hour",
});

// Apply the rate limiter to all requests
app.use(limiter);

async function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Translate server is listening on port ${PORT}`);
  });
}

async function translate(url, language, text) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: language,
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      const statusCode = response.status;
      console.error(errorMessage, statusCode);
      const error = { code: statusCode };
      return { error };
    }

    const data = await response.json();
    const translation = data.data.translations;
    return { body: translation };
  } catch (err) {
    console.error("There was a problem with the fetch operation:", err);
    const error = { code: 500 };
    return { error };
  }
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

  const translateRes = await translate(TRANSLATE_URL, language, text);

  if (translateRes.error) {
    const status = translateRes.error.code || 500;
    let message;
    if (status === 400) {
      message =
        "Bad Request - The request could not be understood or was missing required parameters.";
    } else if (status === 401) {
      message = "Unauthorized - Your API key is wrong.";
    } else if (status === 403) {
      message = "Forbidden - You may have exceeded your quota for requests. Try again later.";
    } else if (status === 503) {
      message = "Service Unavailable - The Google Translate API is temporarily unavailable.";
    } else {
      message = "Internal Server Error";
    }

    res.status(status).send({
      status,
      message,
    });
  } else {
    res.send(translateRes.body);
  }
});

startServer();
