import React from "react";
import { History } from "lucide-react";

const PositionHistory = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card">
      <h2
        className="chart-title"
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <History size={24} color="#94a3b8" />
        Position History
      </h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Closed Date</th>
              <th>Symbol</th>
              <th>Name</th>
              <th className="text-right">Entry Price</th>
              <th className="text-right">Exit Price</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Invested</th>
              <th className="text-right">PNL</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#94a3b8",
                  }}
                >
                  No closed positions
                </td>
              </tr>
            ) : (
              data.map((position) => {
                const pnlPercentage =
                  ((position.exitPrice - position.entryPrice) /
                    position.entryPrice) *
                  100;

                return (
                  <tr key={position.id}>
                    <td>
                      <span style={{ color: "#cbd5e1", fontWeight: "500" }}>
                        {formatDate(position.closedDate)}
                      </span>
                    </td>
                    <td>
                      <span className="symbol">{position.symbol}</span>
                    </td>
                    <td>
                      <span className="company-name">{position.name}</span>
                    </td>
                    <td className="text-right">
                      {formatCurrency(position.entryPrice)}
                    </td>
                    <td className="text-right">
                      {formatCurrency(position.exitPrice)}
                    </td>
                    <td className="text-right">{position.amount.toFixed(4)}</td>
                    <td className="text-right value">
                      {formatCurrency(position.invested)}
                    </td>
                    <td className="text-right">
                      <div
                        className={position.pnl >= 0 ? "positive" : "negative"}
                      >
                        <div style={{ fontWeight: "600" }}>
                          {formatCurrency(position.pnl)}
                        </div>
                        <div style={{ fontSize: "12px" }}>
                          {position.pnl >= 0 ? "+" : ""}
                          {pnlPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                        {position.note || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionHistory;
