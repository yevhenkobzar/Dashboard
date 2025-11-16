import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const AssetAllocation = ({ data }) => {
  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="card">
      <h2 className="chart-title" style={{ marginBottom: "24px" }}>
        Asset Allocation
      </h2>
      <div className="allocation-content">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
              formatter={(value) => formatCurrency(value)}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="allocation-legend">
          {data.map((item, index) => (
            <div key={item.name} className="legend-item">
              <div className="legend-left">
                <div
                  className="legend-dot"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="legend-name">{item.name}</span>
              </div>
              <div className="legend-right">
                <div className="legend-value">{formatCurrency(item.value)}</div>
                <div className="legend-percentage">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
