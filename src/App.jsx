import { getFlights } from "./api/flights"
import { useState } from "react"
import { cities } from "./data/cities"
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const App = () => {
  const [flights, setFlights] = useState([])
  const [departureId, setDepartureId] = useState("")
  const [arrivalId, setArrivalId] = useState("")
  const [outboundDate, setOutboundDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [isTransacting, setIsTransacting] = useState(false)
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // Lower conversion rate for devnet testing (devnet SOL has no real value)
  const SOL_USD_CONVERSION_RATE = 150; // Much lower for easier testing on devnet
  
  const handleSearch = async () => {
    try {
      const data = await getFlights(departureId, arrivalId, outboundDate, returnDate)
      setFlights(data)
    } catch (error) {
      console.error("Flight search failed:", error);
      alert("Failed to search flights. Please try again.");
    }
  }

  const handleBuyTicket = async (price) => {
    if (!publicKey) {
      alert("Please connect your wallet!");
      return;
    }

    if (!connection) {
      alert("No connection to Solana network!");
      return;
    }

    // For devnet testing - you can use your own devnet wallet address
    const recipientAddress = "Bex4mgcANbu7h55K9qHVdhmGyzJnxayX39rF2XHqixzP";
    
    setIsTransacting(true);

    try {
      // Validate recipient address
      let recipientPubkey;
      try {
        recipientPubkey = new PublicKey(recipientAddress);
      } catch (error) {
        throw new Error("Invalid recipient address");
      }

      const solPrice = price / SOL_USD_CONVERSION_RATE;
      const lamportsToSend = Math.floor(solPrice * LAMPORTS_PER_SOL);

      // Check if user has enough SOL (important for devnet testing)
      const balance = await connection.getBalance(publicKey);
      const estimatedFee = 5000; // Transaction fee in lamports
      
      if (balance < lamportsToSend + estimatedFee) {
        // For devnet, suggest getting more SOL from faucet
        throw new Error(`Insufficient SOL balance. Required: ${(lamportsToSend + estimatedFee) / LAMPORTS_PER_SOL} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL. Get devnet SOL from: https://faucet.solana.com/`);
      }

      // Get recent blockhash with proper commitment for devnet
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: lamportsToSend,
        })
      );

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      alert(`Transaction successful! Signature: ${signature}\nView on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      console.log('Transaction signature:', signature);
      
    } catch (error) {
      console.error("Transaction failed:", error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-md">
            🚧 Devnet Mode - Use test SOL only
          </div>
          <WalletMultiButton />
        </div>
        
        {/* Rest of your existing JSX remains the same */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Departure City:</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={departureId} 
                onChange={(e) => setDepartureId(e.target.value)}
              >
                <option value="">Select departure city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Arrival City:</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={arrivalId} 
                onChange={(e) => setArrivalId(e.target.value)}
              >
                <option value="">Select arrival city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Departure Date:</label>
              <input 
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={outboundDate}
                onChange={(e) => setOutboundDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Return Date:</label>
              <input 
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Currency:</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <button 
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSearch}
            disabled={!departureId || !arrivalId || !outboundDate || !returnDate}
          >
            Search Flights
          </button>
        </div>
      </div>

      {flights.best_flights && (
        <div className="mt-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Flights</h2>
          <div className="space-y-6">
            {flights.best_flights.map((flight, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Duration: {Math.floor(flight.total_duration / 60)}h {flight.total_duration % 60}m</h3>
                    <p className="text-sm text-gray-500">{flight.type}</p>
                    <p className="text-sm text-gray-500">{flight.layovers && flight.layovers.length > 0 ? `${flight.layovers.length} layover${flight.layovers.length > 1 ? 's' : ''}` : 'Direct flight'}</p>
                  </div> 
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-600">${flight.price} {currency}</p>
                    <p className="text-sm text-gray-500">≈ {(flight.price / SOL_USD_CONVERSION_RATE).toFixed(4)} SOL (devnet)</p>
                    <button 
                      className="mt-2 bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleBuyTicket(flight.price)}
                      disabled={isTransacting || !publicKey}
                    >
                      {isTransacting ? 'Processing...' : 'Buy with SOL (Devnet)'}
                    </button>
                  </div>
                </div>
                
                {/* Rest of your flight details JSX remains the same */}
                {flight.flights.map((segment, segmentIndex) => (
                  <div key={segmentIndex}>
                    <div className="mb-4 border-t pt-4">
                      <div className="flex items-center gap-4 mb-3">
                        {segment.airline_logo && <img src={segment.airline_logo} alt={segment.airline} className="h-8 w-8 object-contain"/>}
                        <span className="text-gray-900 font-medium">{segment.airline} {segment.flight_number}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-gray-900 font-medium">{segment.departure_airport?.time?.split(' ')[1]}</p>
                          <p className="text-gray-600">{segment.departure_airport?.id}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">{Math.floor(segment.duration / 60)}h {segment.duration % 60}m</p>
                          <div className="border-t-2 border-gray-300 w-24 my-2 mx-auto"></div>
                          <p className="text-sm text-gray-500">{segment.airplane}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 font-medium">{segment.arrival_airport?.time?.split(' ')[1]}</p>
                          <p className="text-gray-600">{segment.arrival_airport?.id}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>{segment.travel_class} {segment.legroom && `• ${segment.legroom}`}</p>
                        {segment.extensions && <div className="mt-1">
                          {segment.extensions.map((ext, extIndex) => (
                            <p key={extIndex}>{ext}</p>
                          ))}
                        </div>}
                      </div>
                    </div>
                    {flight.layovers && flight.layovers[segmentIndex] && (
                      <div className="my-4 border-l-2 border-dashed border-gray-300 ml-4 pl-8 py-2">
                        <p className="font-semibold text-gray-700">Layover: {flight.layovers[segmentIndex].name} ({flight.layovers[segmentIndex].id})</p>
                        <p className="text-sm text-gray-500">Duration: {Math.floor(flight.layovers[segmentIndex].duration / 60)}h {flight.layovers[segmentIndex].duration % 60}m</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
