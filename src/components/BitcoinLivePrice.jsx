import { useEffect, useState } from "react";
import './BitcoinLivePrice.css'


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
        <div className="btc-price-container">
            {error ? (
                <span className="btc-error">{error}</span>
            ) : btcPrice ? (
                <>
                    <p className="btc-label">
                        Live price in USD updated at {lastUpdated}
                    </p>
                    <div className="btc-digital-display">
                        ${btcPrice}
                    </div>
                </>
            ) : (
                <p className="btc-loading">Loading Bitcoin price...</p>
            )}
        </div>
    );
}

export default BTCPrice