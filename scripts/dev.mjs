// Local preview: serves public/ and runs api/*.js like Vercel does. http://localhost:3005
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const root = new URL("../public/", import.meta.url);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };

createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  if (path.startsWith("/api/")) {
    let raw = ""; for await (const c of req) raw += c;
    req.body = raw ? JSON.parse(raw) : {};
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
    return require("../api" + path.slice(4) + ".js")(req, res);
  }
  let file = path === "/" ? "index.html" : path.slice(1);
  if (!existsSync(new URL(file, root)) && existsSync(new URL(file + ".html", root))) file += ".html";
  if (!existsSync(new URL(file, root))) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", types[file.slice(file.lastIndexOf("."))] || "application/octet-stream");
  res.end(readFileSync(new URL(file, root)));
}).listen(3005, () => console.log("http://localhost:3005"));
