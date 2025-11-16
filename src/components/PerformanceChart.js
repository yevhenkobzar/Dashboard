import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PerformanceChart = ({ data, timeframe, onTimeframeChange }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="card chart-section">
      <div className="chart-header">
        <h2 className="chart-title">Portfolio Performance</h2>
        <div className="timeframe-buttons">
          {["1W", "1M", "3M", "1Y"].map((period) => (
            <button
              key={period}
              onClick={() => onTimeframeChange(period)}
              className={`timeframe-btn ${
                timeframe === period ? "active" : ""
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data[timeframe]}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis
            stroke="#9ca3af"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
            formatter={(value) => [formatCurrency(value), "Value"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
