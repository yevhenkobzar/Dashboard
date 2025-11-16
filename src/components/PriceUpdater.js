import React, { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { fetchPrices } from "../services/priceService";

const PriceUpdater = ({ positions, onPricesUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const updatePrices = async () => {
    setIsUpdating(true);

    // Get all unique symbols from positions
    const symbols = [...new Set(positions.map((p) => p.symbol))];

    try {
      const prices = await fetchPrices(symbols);
      onPricesUpdate(prices);
      setLastUpdate(new Date());
      setCountdown(60); // Reset countdown
    } catch (error) {
      console.error("Failed to update prices:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      updatePrices();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, positions]);

  // Countdown timer
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh]);

  // Initial price fetch
  useEffect(() => {
    updatePrices();
  }, []);

  const formatTime = (date) => {
    if (!date) return "Never";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="price-updater">
      <div className="price-updater-content">
        <div className="price-updater-info">
          <span className="price-updater-label">
            Last Update: {formatTime(lastUpdate)}
          </span>
          {autoRefresh && (
            <span className="price-updater-countdown">
              Next update in {countdown}s
            </span>
          )}
        </div>
        <div className="price-updater-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <button
            className="btn-refresh"
            onClick={updatePrices}
            disabled={isUpdating}
          >
            <RefreshCw size={16} className={isUpdating ? "spinning" : ""} />
            {isUpdating ? "Updating..." : "Refresh Prices"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceUpdater;
