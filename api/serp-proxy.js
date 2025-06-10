// Vercel API route to proxy SerpApi requests
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters from the request
    const params = req.query;
    
    // Add the API key from environment variables
    const apiKey = process.env.SERPAPI_KEY || process.env.VITE_SERP_API_KEY;
    const apiParams = new URLSearchParams({
      api_key: apiKey,
      engine: params.engine || 'google_flights',
      hl: params.hl || 'en',
      gl: params.gl || 'us',
      departure_id: params.departure_id,
      arrival_id: params.arrival_id,
      outbound_date: params.outbound_date,
      return_date: params.return_date,
      currency: params.currency || 'USD'
    });
    
    // Make the request to SerpApi
    const response = await fetch(`https://serpapi.com/search.json?${apiParams.toString()}`);
    const data = await response.json();
    
    // Return the data
    res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying to SerpApi:', error);
    res.status(500).json({ error: 'Failed to fetch flight data' });
  }
} 