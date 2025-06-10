export const getFlights = async (departureId, arrivalId, outboundDate, returnDate, currency = "USD") => {
  const params = new URLSearchParams({
    departureId,
    arrivalId,
    outboundDate,
    returnDate,
    currency,
  });

  // Use absolute URL for production (Vercel) and relative URL for development
  const baseUrl = import.meta.env.PROD 
    ? window.location.origin 
    : '';
  
  const response = await fetch(`${baseUrl}/api/flights?${params.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Something went wrong');
  }

  return response.json();
};