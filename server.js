import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

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
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
}); 