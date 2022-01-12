require("dotenv").config();
const express = require("express");
const cors = require("cors");

//websocket server
const http = require("http");
const { Server } = require("socket.io");
const router = require("./src/routes/index");

const app = express();

const server = http.createServer(app);

const port = 5000;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use("/api/v1", router);

//not found
app.use((req, res) => {
  res.sendStatus(404);
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
