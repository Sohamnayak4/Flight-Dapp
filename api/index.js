import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.VITE_SERP_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Route requests based on path
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (path === '/api/flights' && req.method === 'GET') {
    return handleFlightsRequest(req, res);
  }

  // Default response for unmatched routes
  return res.status(404).json({ error: 'Not found' });
};

async function handleFlightsRequest(req, res) {
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
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    res.status(500).json({ error: error.toString() });
  }
} 