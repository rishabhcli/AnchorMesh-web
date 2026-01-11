const http = require("http"); http.createServer((req,res) => res.end("hi")).listen(3000, () => console.log("listening"));
