const express = require('express');
const fs = require("fs/promises")
const axios = require("axios")
const app = express();

// These are the config parameter that are required
const config = {
  host: "https://api.minut.com/v7",
  clientId: "<<your client id>>",
  clientSecret: "<<your client secret>>",
  redirectUrl: "http://localhost:3016",
  authorizationUrl: "/oauth/authorize",
  tokenUrl: "/oauth/token",
}

app.get("/", async (req, res, next) => {
  let email = "" // This will be set if the user is logged in

  // Upon successful authentication the user will be redirected
  // here with a code parameter
  const code = req.query.code;
  if (code) {
    const body = {
      response_type: "token",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      redirect_uri: config.redirectUrl,
      grant_type: "authorization_code"
    }
    try {
      // This is a standard OAuth 2.0 token request using the authorization code grant
      let result = await axios.post(`${config.host}${config.tokenUrl}`, body)
      const token = result.data.access_token

      // This is the request to the minut user endpoint to get the email
      result = await axios.get(`${config.host}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      email = result.data.email

    } catch (err) {
      res.send(err.response.data)
    }
  }

  // This is just a simple example to serve the html file
  const url = `${config.host}${config.authorizationUrl}?client_id=${config.clientId}&response_type=code&redirect_uri=${config.redirectUrl}`
  let file = await fs.readFile("index.html", { encoding: "utf8" })
  file = file.replace("URL", url)
  file = file.replace("EMAIL", email)
  res.setHeader("Content-Type", "text/html")
  res.status(200).send(file)
})

app.listen(3016)
