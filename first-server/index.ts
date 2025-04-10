import http from "http";
import fs from "fs/promises";

const server = http.createServer((req, res) => {
  req.url = req.url === "/" ? "./index.html" : `.${req.url ?? "404.html"}`;

  fs.readFile(req.url, "utf-8")
    .then((data) => {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(data);
    })
    .catch(async () => {
      res.writeHead(404, { "content-type": "text/html" });
      const data = await fs.readFile("./404.html", "utf-8");
      res.end(data);
    });
});

server.listen(3030, () => {
  console.log("server started");
});
