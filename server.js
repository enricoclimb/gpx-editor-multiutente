const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Connessione al DB PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let trackState = { type: 'FeatureCollection', features: [] };

async function loadTrackFromDB() {
  const res = await pool.query('SELECT geojson FROM tracks WHERE id=1');
  if (res.rows.length) trackState = res.rows[0].geojson;
}

async function saveTrackToDB() {
  await pool.query(`INSERT INTO tracks (id, geojson) VALUES (1, $1)
                    ON CONFLICT (id) DO UPDATE SET geojson = EXCLUDED.geojson`, [trackState]);
}

io.on('connection', async (socket) => {
  console.log('Client connected', socket.id);
  await loadTrackFromDB();
  socket.emit('init', trackState);

  socket.on('replaceTrack', async (newTrack) => {
    trackState = newTrack;
    await saveTrackToDB();
    socket.broadcast.emit('replaceTrack', newTrack);
  });

  socket.on('addPoint', async (feature) => {
    trackState.features.push(feature);
    await saveTrackToDB();
    socket.broadcast.emit('addPoint', feature);
  });

  socket.on('disconnect', () => console.log('Client disconnected', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
