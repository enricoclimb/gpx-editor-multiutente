const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve il client buildato
app.use(express.static(path.join(__dirname, "client", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Nuovo client connesso:", socket.id);
  socket.on("update-track", (data) => socket.broadcast.emit("update-track", data));
  socket.on("disconnect", () => console.log("Client disconnesso:", socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server avviato su porta ${PORT}`));
