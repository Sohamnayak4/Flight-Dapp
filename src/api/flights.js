export const getFlights = async (departureId, arrivalId, outboundDate, returnDate, currency = "USD") => {
  const params = new URLSearchParams({
    departureId,
    arrivalId,
    outboundDate,
    returnDate,
    currency,
  });

  const response = await fetch(`/api/flights?${params.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Something went wrong');
  }

  return response.json();
};