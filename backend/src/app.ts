import express from "express";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import cors from "cors";
import "./db/mainConnection";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

const port = "3002";

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
