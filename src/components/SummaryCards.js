import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  PieChart,
} from "lucide-react";

const SummaryCards = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="summary-cards">
      {/* Total Value */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Total Value</span>
          <DollarSign size={20} color="#60a5fa" />
        </div>
        <div className="summary-card-value">
          {formatCurrency(data.totalValue)}
        </div>
        <div
          className={`summary-card-change ${
            data.dayChange >= 0 ? "positive" : "negative"
          }`}
        >
          {data.dayChange >= 0 ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          {formatCurrency(Math.abs(data.dayChange))} (
          {formatPercentage(data.dayChangePercentage)}) today
        </div>
      </div>

      {/* Total Return */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Total Return</span>
          <Activity size={20} color="#4ade80" />
        </div>
        <div className="summary-card-value">
          {formatCurrency(data.totalGain)}
        </div>
        <div className="summary-card-change positive">
          <TrendingUp size={16} />
          {formatPercentage(data.gainPercentage)} all time
        </div>
      </div>

      {/* Best Performer */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Best Performer</span>
          <TrendingUp size={20} color="#4ade80" />
        </div>
        <div className="summary-card-value">{data.bestPerformer.symbol}</div>
        <div className="summary-card-change positive">
          +{data.bestPerformer.return}% return
        </div>
      </div>

      {/* Total Assets */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-label">Total Assets</span>
          <PieChart size={20} color="#a78bfa" />
        </div>
        <div className="summary-card-value">{data.totalAssets}</div>
        <div className="summary-card-change" style={{ color: "#94a3b8" }}>
          Across {data.assetCategories} categories
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
