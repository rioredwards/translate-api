const form = document.getElementById("translate-form");
const textEl = document.getElementById("text");
const languageEl = document.getElementById("language");
const result = document.getElementById("result");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = textEl.value;
  const language = languageEl.value;

  fetch("https://translate-424302.uc.r.appspot.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, language }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Something went wrong...");
      }
      return res.json();
    })
    .then((data) => {
      result.innerText = JSON.stringify(data, null, 2);
    })
    .catch((error) => {
      console.warn(error);
    });
});
