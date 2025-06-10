// Simple development server for testing API routes locally
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Enable CORS
  app.use(cors());

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Use Vite's connect instance as middleware
  app.use(vite.middlewares);

  // Handle API routes
  app.get('/api/flights', async (req, res) => {
    const { departureId, arrivalId, outboundDate, returnDate, currency } = req.query;

    if (!departureId || !arrivalId || !outboundDate) {
      return res.status(400).json({ error: 'Missing required query parameters.' });
    }

    const params = new URLSearchParams({
      api_key: process.env.VITE_SERP_API_KEY,
      engine: 'google_flights',
      hl: 'en',
      gl: 'us',
      departure_id: departureId,
      arrival_id: arrivalId,
      outbound_date: outboundDate,
      return_date: returnDate,
      currency: currency,
    });

    try {
      const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching flight data:', error);
      res.status(500).json({ error: error.toString() });
    }
  });

  // Serve static files from the dist directory
  app.use(express.static(join(__dirname, 'dist')));

  // For all other routes, serve the index.html file
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer(); 