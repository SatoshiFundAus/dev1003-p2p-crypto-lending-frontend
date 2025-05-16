import { useEffect, useState } from "react";


function BTCPrice() {
    const [btcPrice, setBtcPrice] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);

    const getBTCLivePrice = async () => {
        try {
            const res = await fetch('https://pricing.bitcoin.block.xyz/current-price');

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json();
            const formattedDate = new Date(
                data.last_updated_at_in_utc_epoch_seconds * 1000
            ).toLocaleString();

            setBtcPrice(data.amount);
            setLastUpdated(formattedDate);
            setError(null);
        } catch (err) {
            console.error('Error fetching Bitcoin price:', err);
            setError('Unable to retrieve current Bitcoin price.')
        }
    }

    useEffect(() => {
        getBTCLivePrice(); // Initial fetch
        const interval = setInterval(getBTCLivePrice, 60000); // Refresh every minute

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            {error ? (
                <span style={{ color: 'red' }}>{error}</span>
            ) : btcPrice ? (
                <>
                    <p>
                        Live price in USD updated at {lastUpdated}, refreshing every minute:
                    </p>
                    <h2 style={{ color: '#f7931a' }}>${btcPrice}</h2>
                </>
            ) : (
                <p>Loading Bitcoin price...</p>
            )}
        </div>
    );
}

export default BTCPrice