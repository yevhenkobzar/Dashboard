import React from "react";
import { X } from "lucide-react";

const HoldingsTable = ({ data, onClosePosition }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculatePNL = (position) => {
    if (position.isCash) return 0;
    return (position.currentPrice - position.entryPrice) * position.amount;
  };

  const calculatePNLPercentage = (position) => {
    if (position.isCash) return 0;
    return (
      ((position.currentPrice - position.entryPrice) / position.entryPrice) *
      100
    );
  };

  const getCurrentValue = (position) => {
    return position.amount * position.currentPrice;
  };

  // Calculate total portfolio value
  const totalPortfolioValue = data.reduce((sum, position) => {
    return sum + getCurrentValue(position);
  }, 0);

  const calculatePortfolioPercentage = (position) => {
    const currentValue = getCurrentValue(position);
    return (currentValue / totalPortfolioValue) * 100;
  };

  return (
    <div className="card" style={{ marginBottom: "32px" }}>
      <h2 className="chart-title" style={{ marginBottom: "24px" }}>
        Active Positions
      </h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th className="text-right">Entry Price</th>
              <th className="text-right">Current Price</th>
              <th className="text-right">24h Change</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Invested</th>
              <th className="text-right">Current Value</th>
              <th className="text-right">% Portfolio</th>
              <th className="text-right">PNL</th>
              <th>Note</th>
              {onClosePosition && <th className="text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={onClosePosition ? 12 : 11}
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#94a3b8",
                  }}
                >
                  No active positions
                </td>
              </tr>
            ) : (
              data.map((position) => {
                const pnl = calculatePNL(position);
                const pnlPercentage = calculatePNLPercentage(position);
                const currentValue = getCurrentValue(position);
                const portfolioPercentage =
                  calculatePortfolioPercentage(position);

                return (
                  <tr
                    key={position.id}
                    className={position.isCash ? "cash-row" : ""}
                  >
                    <td>
                      <span
                        className="symbol"
                        style={position.isCash ? { color: "#10b981" } : {}}
                      >
                        {position.symbol}
                      </span>
                    </td>
                    <td>
                      <span className="company-name">{position.name}</span>
                    </td>
                    <td className="text-right">
                      {position.isCash
                        ? "-"
                        : formatCurrency(position.entryPrice)}
                    </td>
                    <td className="text-right">
                      {position.isCash
                        ? "-"
                        : formatCurrency(position.currentPrice)}
                    </td>
                    <td className="text-right">
                      {position.isCash || !position.change24h ? (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      ) : (
                        <div
                          className={
                            position.change24h >= 0 ? "positive" : "negative"
                          }
                        >
                          <span style={{ fontSize: "13px", fontWeight: "600" }}>
                            {position.change24h >= 0 ? "+" : ""}
                            {position.change24h.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      {position.isCash
                        ? formatCurrency(position.amount)
                        : position.amount.toFixed(4)}
                    </td>
                    <td className="text-right value">
                      {formatCurrency(position.invested)}
                    </td>
                    <td className="text-right value">
                      {formatCurrency(currentValue)}
                    </td>
                    <td className="text-right">
                      <div className="portfolio-percentage">
                        {portfolioPercentage.toFixed(2)}%
                      </div>
                    </td>
                    <td className="text-right">
                      {position.isCash ? (
                        <div style={{ color: "#94a3b8" }}>-</div>
                      ) : (
                        <div className={pnl >= 0 ? "positive" : "negative"}>
                          <div style={{ fontWeight: "600" }}>
                            {formatCurrency(pnl)}
                          </div>
                          <div style={{ fontSize: "12px" }}>
                            {pnl >= 0 ? "+" : ""}
                            {pnlPercentage.toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                        {position.note || "-"}
                      </span>
                    </td>
                    {onClosePosition && (
                      <td className="text-center">
                        {!position.isCash && (
                          <button
                            className="btn-close"
                            onClick={() => onClosePosition(position.id)}
                            title="Close position"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid #475569", fontWeight: "bold" }}>
              <td colSpan="7" style={{ color: "white", paddingTop: "16px" }}>
                TOTAL
              </td>
              <td className="text-right value" style={{ paddingTop: "16px" }}>
                {formatCurrency(totalPortfolioValue)}
              </td>
              <td
                className="text-right"
                style={{ paddingTop: "16px", color: "white" }}
              >
                100.00%
              </td>
              <td colSpan={onClosePosition ? 3 : 2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;
