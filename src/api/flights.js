export const getFlights = async (departureId, arrivalId, outboundDate, returnDate, currency = "USD") => {
  try {
    // Create params for SerpApi
    const params = new URLSearchParams({
      api_key: import.meta.env.VITE_SERP_API_KEY,
      engine: "google_flights",
      hl: "en", 
      gl: "us",
      departure_id: departureId,
      arrival_id: arrivalId,
      outbound_date: outboundDate,
      return_date: returnDate,
      currency: currency
    });

    // Use a public CORS proxy to bypass CORS restrictions
    // Options include:
    // - https://corsproxy.io/ 
    // - https://cors-anywhere.herokuapp.com/ (requires activation)
    // - https://api.allorigins.win/raw?url= 
    const serpApiUrl = `https://serpapi.com/search.json?${params.toString()}`;
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(serpApiUrl)}`;
    
    const response = await fetch(corsProxyUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch flight data');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching flights:", error);
    throw error;
  }
};