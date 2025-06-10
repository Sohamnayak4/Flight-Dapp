export const getFlights = async (departureId, arrivalId, outboundDate, returnDate, currency = "USD") => {
  try {
    // Create params for our proxy endpoint
    const params = new URLSearchParams({
      engine: "google_flights",
      hl: "en", 
      gl: "us",
      departure_id: departureId,
      arrival_id: arrivalId,
      outbound_date: outboundDate,
      return_date: returnDate,
      currency: currency
    });

    // Call our proxy endpoint instead of SerpApi directly
    // This avoids CORS issues and keeps API keys secure
    const response = await fetch(`/api/serp-proxy?${params.toString()}`);
    
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