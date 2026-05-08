const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

const endpoints = [
  'https://api.instructure.com',
  'https://backend.instructure.com',
  'https://frontend.instructure.com',
  'https://auth.instructure.com',
  'https://forsyth.instructure.com'
];

let statusData = [];

async function pingAll() {
  statusData = await Promise.all(
    endpoints.map(async (url) => {
      const start = Date.now();

      try {
        const res = await axios.get(url, {
          timeout: 3000,
          validateStatus: () => true
        });

        return {
          url,
          online: true,
          status: res.status,
          latency: Date.now() - start,
          checkedAt: new Date().toISOString()
        };
      } catch (err) {
        return {
          url,
          online: false,
          error: err.message,
          latency: Date.now() - start,
          checkedAt: new Date().toISOString()
        };
      }
    })
  );

  console.log("Ping updated:", new Date().toLocaleTimeString());
}

pingAll();
setInterval(pingAll, 3000);

app.get('/api/status', (req, res) => {
  res.json(statusData);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
