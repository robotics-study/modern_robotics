const axios = require("axios")
const fs = require("fs")
const githubInstance = axios.create({
  baseURL: "https://api.github.com"
})

githubInstance.get("users/ladianchad").then(res => {
  fs.writeFile("./src/git_metadata.json", JSON.stringify({
    id: res.data.login,
    avatar_url: res.data.avatar_url,
    url: res.data.url,
    repos_url: res.data.repos_url
  }),() => {})
})
