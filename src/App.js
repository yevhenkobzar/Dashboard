import React, { useState, useEffect } from "react";
import "./App1.css";
import PerformanceChart from "./components/PerformanceChart";
import SummaryCards from "./components/SummaryCards";
import AssetAllocation from "./components/AssetAllocation";
import HoldingsTable from "./components/HoldingsTable";
import AddPositionForm from "./components/AddPositionForm";
import PositionHistory from "./components/PositionHistory";
import PriceUpdater from "./components/PriceUpdater";
import {
  fetchPositions,
  fetchHistory,
  addPosition as dbAddPosition,
  updatePosition,
  deletePosition,
  addToHistory,
  initializePortfolio,
} from "./services/databaseService";

function App() {
  const [activeTab, setActiveTab] = useState("summary");
  const [timeframe, setTimeframe] = useState("1M");
  const [loading, setLoading] = useState(true);

  // State for positions
  const [liquidPositions, setLiquidPositions] = useState([]);
  const [liquidHistory, setLiquidHistory] = useState([]);
  const [liquid2Positions, setLiquid2Positions] = useState([]);
  const [liquid2History, setLiquid2History] = useState([]);

  // Convert DB format to frontend format
  const convertPosition = (p) => ({
    id: p.id,
    symbol: p.symbol,
    name: p.name,
    entryPrice: parseFloat(p.entry_price),
    currentPrice: parseFloat(p.current_price),
    amount: parseFloat(p.amount),
    invested: parseFloat(p.invested),
    note: p.note,
    isCash: p.is_cash,
    change24h: p.change_24h ? parseFloat(p.change_24h) : 0,
  });

  const convertHistory = (h) => ({
    id: h.id,
    symbol: h.symbol,
    name: h.name,
    entryPrice: parseFloat(h.entry_price),
    exitPrice: parseFloat(h.exit_price),
    amount: parseFloat(h.amount),
    invested: parseFloat(h.invested),
    pnl: parseFloat(h.pnl),
    note: h.note,
    closedDate: h.closed_date,
  });

  // Load data from Supabase
  const loadPortfolioData = async () => {
    try {
      const liquidPos = await fetchPositions("liquid");
      const liquidHist = await fetchHistory("liquid");
      const liquid2Pos = await fetchPositions("liquid2");
      const liquid2Hist = await fetchHistory("liquid2");

      setLiquidPositions(liquidPos.map(convertPosition));
      setLiquidHistory(liquidHist.map(convertHistory));
      setLiquid2Positions(liquid2Pos.map(convertHistory));
      setLiquid2History(liquid2Hist.map(convertHistory));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Load data on mount
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await initializePortfolio("liquid");
        await initializePortfolio("liquid2");
        await loadPortfolioData();
      } catch (error) {
        console.error("Error initializing:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Calculate portfolio metrics from positions
  const calculateMetrics = (positions) => {
    const totalInvested = positions.reduce((sum, p) => sum + p.invested, 0);
    const currentValue = positions.reduce(
      (sum, p) => sum + p.amount * p.currentPrice,
      0
    );
    const totalGain = currentValue - totalInvested;
    const gainPercentage =
      totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    const positionsWithReturns = positions.map((p) => ({
      symbol: p.symbol,
      return: p.isCash
        ? 0
        : ((p.currentPrice - p.entryPrice) / p.entryPrice) * 100,
    }));
    const bestPerformer = positionsWithReturns.reduce(
      (best, current) => (current.return > best.return ? current : best),
      { symbol: "-", return: 0 }
    );

    return {
      totalValue: currentValue,
      totalGain: totalGain,
      gainPercentage: gainPercentage,
      dayChange: currentValue * 0.01,
      dayChangePercentage: 1.01,
      bestPerformer: bestPerformer,
      totalAssets: positions.length,
      assetCategories: 4,
    };
  };

  const liquidMetrics = calculateMetrics(liquidPositions);
  const liquid2Metrics = calculateMetrics(liquid2Positions);

  // Performance data - mock for now
  const performanceData = {
    "1W": [
      { date: "Mon", value: 840000 },
      { date: "Tue", value: 835000 },
      { date: "Wed", value: 848000 },
      { date: "Thu", value: 842000 },
      { date: "Fri", value: 851000 },
      { date: "Sat", value: 845000 },
      { date: "Sun", value: 850000 },
    ],
    "1M": [
      { date: "Week 1", value: 780000 },
      { date: "Week 2", value: 810000 },
      { date: "Week 3", value: 830000 },
      { date: "Week 4", value: 850000 },
    ],
    "3M": [
      { date: "Month 1", value: 725000 },
      { date: "Month 2", value: 795000 },
      { date: "Month 3", value: 850000 },
    ],
    "1Y": [
      { date: "Jan", value: 725000 },
      { date: "Mar", value: 750000 },
      { date: "May", value: 780000 },
      { date: "Jul", value: 800000 },
      { date: "Sep", value: 825000 },
      { date: "Nov", value: 850000 },
    ],
  };

  // Calculate allocation from positions
  const calculateAllocation = (positions) => {
    const totalValue = positions.reduce(
      (sum, p) => sum + p.amount * p.currentPrice,
      0
    );
    if (totalValue === 0) return [];

    const grouped = positions.reduce((acc, p) => {
      const value = p.amount * p.currentPrice;
      if (acc[p.symbol]) {
        acc[p.symbol] += value;
      } else {
        acc[p.symbol] = value;
      }
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: (value / totalValue) * 100,
    }));
  };

  const liquidAllocation = calculateAllocation(liquidPositions);
  const liquid2Allocation = calculateAllocation(liquid2Positions);
  const combinedAllocation = calculateAllocation([
    ...liquidPositions,
    ...liquid2Positions,
  ]);

  // Combined summary
  const summaryMetrics = {
    totalValue: liquidMetrics.totalValue + liquid2Metrics.totalValue,
    totalGain: liquidMetrics.totalGain + liquid2Metrics.totalGain,
    gainPercentage:
      ((liquidMetrics.totalGain + liquid2Metrics.totalGain) /
        (liquidMetrics.totalValue +
          liquid2Metrics.totalValue -
          liquidMetrics.totalGain -
          liquid2Metrics.totalGain)) *
        100 || 0,
    dayChange: liquidMetrics.dayChange + liquid2Metrics.dayChange,
    dayChangePercentage: 1.01,
    bestPerformer:
      liquidMetrics.bestPerformer.return > liquid2Metrics.bestPerformer.return
        ? liquidMetrics.bestPerformer
        : liquid2Metrics.bestPerformer,
    totalAssets: liquidPositions.length + liquid2Positions.length,
    assetCategories: 5,
  };

  // Add position handler
  const handleAddPosition = async (newPosition, portfolio) => {
    const investmentAmount = newPosition.entryPrice * newPosition.amount;

    const position = {
      ...newPosition,
      id: `pos-${Date.now()}`,
      invested: investmentAmount,
    };

    try {
      await dbAddPosition(position, portfolio);

      const positions =
        portfolio === "liquid" ? liquidPositions : liquid2Positions;
      const cashPosition = positions.find((p) => p.isCash);

      if (cashPosition) {
        await updatePosition(cashPosition.id, {
          amount: cashPosition.amount - investmentAmount,
          invested: cashPosition.invested - investmentAmount,
        });
      }

      await loadPortfolioData();
    } catch (error) {
      alert("Error adding position. Please try again.");
      console.error(error);
    }
  };

  // Add cash handler
  const handleAddCash = async (amount, portfolio) => {
    try {
      const positions =
        portfolio === "liquid" ? liquidPositions : liquid2Positions;
      const cashPosition = positions.find((p) => p.isCash);

      if (cashPosition) {
        await updatePosition(cashPosition.id, {
          amount: cashPosition.amount + amount,
          invested: cashPosition.invested + amount,
        });
      }

      await loadPortfolioData();
    } catch (error) {
      alert("Error adding cash. Please try again.");
      console.error(error);
    }
  };

  // Remove cash handler
  const handleRemoveCash = async (amount, portfolio) => {
    try {
      const positions =
        portfolio === "liquid" ? liquidPositions : liquid2Positions;
      const cashPosition = positions.find((p) => p.isCash);

      if (cashPosition) {
        await updatePosition(cashPosition.id, {
          amount: cashPosition.amount - amount,
          invested: cashPosition.invested - amount,
        });
      }

      await loadPortfolioData();
    } catch (error) {
      alert("Error removing cash. Please try again.");
      console.error(error);
    }
  };

  // Close position handler
  const handleClosePosition = async (positionId, portfolio) => {
    try {
      const positions =
        portfolio === "liquid" ? liquidPositions : liquid2Positions;
      const position = positions.find((p) => p.id === positionId);

      if (position) {
        const exitValue = position.amount * position.currentPrice;
        const closedPosition = {
          ...position,
          exitPrice: position.currentPrice,
          pnl: (position.currentPrice - position.entryPrice) * position.amount,
          closedDate: new Date().toISOString().split("T")[0],
        };

        // Add to history
        await addToHistory(closedPosition, portfolio);

        // Delete position
        await deletePosition(positionId);

        // Update cash
        const cashPosition = positions.find((p) => p.isCash);
        if (cashPosition) {
          await updatePosition(cashPosition.id, {
            amount: cashPosition.amount + exitValue,
            invested: cashPosition.invested + exitValue,
          });
        }

        await loadPortfolioData();
      }
    } catch (error) {
      alert("Error closing position. Please try again.");
      console.error(error);
    }
  };

  // Price update handler
  const handlePricesUpdate = async (prices) => {
    try {
      // Update liquid positions
      for (const position of liquidPositions) {
        if (position.isCash) continue;

        const priceData = prices[position.symbol];
        if (priceData) {
          await updatePosition(position.id, {
            currentPrice: priceData.price,
            change24h: priceData.change24h,
          });
        }
      }

      // Update liquid2 positions
      for (const position of liquid2Positions) {
        if (position.isCash) continue;

        const priceData = prices[position.symbol];
        if (priceData) {
          await updatePosition(position.id, {
            currentPrice: priceData.price,
            change24h: priceData.change24h,
          });
        }
      }

      await loadPortfolioData();
    } catch (error) {
      console.error("Error updating prices:", error);
    }
  };

  // Export data handler
  const handleExportData = async () => {
    try {
      const data = {
        liquidPositions,
        liquidHistory,
        liquid2Positions,
        liquid2History,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `monolith-portfolio-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error exporting data.");
      console.error(error);
    }
  };

  // Reset data handler
  const handleResetData = async () => {
    if (
      window.confirm(
        "⚠️ Are you sure you want to reset ALL portfolio data? This will affect ALL users!"
      )
    ) {
      if (
        window.confirm(
          "⚠️ FINAL WARNING: This will delete all positions and history for EVERYONE. Continue?"
        )
      ) {
        try {
          // Delete all positions
          for (const pos of liquidPositions) {
            if (!pos.isCash) await deletePosition(pos.id);
          }
          for (const pos of liquid2Positions) {
            if (!pos.isCash) await deletePosition(pos.id);
          }

          // Reset cash to 0
          const liquidCash = liquidPositions.find((p) => p.isCash);
          const liquid2Cash = liquid2Positions.find((p) => p.isCash);

          if (liquidCash) {
            await updatePosition(liquidCash.id, { amount: 0, invested: 0 });
          }
          if (liquid2Cash) {
            await updatePosition(liquid2Cash.id, { amount: 0, invested: 0 });
          }

          await loadPortfolioData();
          alert("Portfolio data has been reset.");
        } catch (error) {
          alert("Error resetting data.");
          console.error(error);
        }
      }
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === "liquid") {
      return {
        metrics: liquidMetrics,
        allocation: liquidAllocation,
        positions: liquidPositions,
        history: liquidHistory,
        portfolio: "liquid",
      };
    }
    if (activeTab === "liquid2") {
      return {
        metrics: liquid2Metrics,
        allocation: liquid2Allocation,
        positions: liquid2Positions,
        history: liquid2History,
        portfolio: "liquid2",
      };
    }

    // Summary - combine positions and merge cash
    const liquidCash = liquidPositions.find((p) => p.isCash);
    const liquid2Cash = liquid2Positions.find((p) => p.isCash);
    const combinedCashAmount =
      (liquidCash?.amount || 0) + (liquid2Cash?.amount || 0);

    const combinedCash = {
      id: "cash-summary",
      symbol: "CASH",
      name: "Cash (USD)",
      entryPrice: 1,
      currentPrice: 1,
      amount: combinedCashAmount,
      invested: combinedCashAmount,
      note: "Combined available cash",
      isCash: true,
    };

    const nonCashPositions = [
      ...liquidPositions.filter((p) => !p.isCash),
      ...liquid2Positions.filter((p) => !p.isCash),
    ];

    const combinedPositions = [combinedCash, ...nonCashPositions];

    return {
      metrics: summaryMetrics,
      allocation: combinedAllocation,
      positions: combinedPositions,
      history: [...liquidHistory, ...liquid2History],
      portfolio: "summary",
    };
  };

  const currentData = getCurrentData();

  if (loading) {
    return (
      <div className="app">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "#3b82f6",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Loading Portfolio...
            </div>
            <div style={{ color: "#94a3b8" }}>Please wait</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header with Tabs */}
        <header className="header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1>Monolith</h1>
              <p>Crypto Fund Management</p>
            </div>
            <div className="data-controls">
              <button
                className="btn-control"
                onClick={handleExportData}
                title="Export portfolio data"
              >
                📥 Export
              </button>
              <button
                className="btn-control btn-danger"
                onClick={handleResetData}
                title="Reset all data"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              Summary
            </button>
            <button
              className={`tab ${activeTab === "liquid" ? "active" : ""}`}
              onClick={() => setActiveTab("liquid")}
            >
              Liquid
            </button>
            <button
              className={`tab ${activeTab === "liquid2" ? "active" : ""}`}
              onClick={() => setActiveTab("liquid2")}
            >
              Liquid 2
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <SummaryCards data={currentData.metrics} />

        {/* Price Updater */}
        <PriceUpdater
          positions={currentData.positions}
          onPricesUpdate={handlePricesUpdate}
        />

        {/* Add Position Form - Only show on individual portfolio tabs */}
        {activeTab !== "summary" && (
          <AddPositionForm
            onAddPosition={(position) =>
              handleAddPosition(position, currentData.portfolio)
            }
            onAddCash={(amount) => handleAddCash(amount, currentData.portfolio)}
            onRemoveCash={(amount) =>
              handleRemoveCash(amount, currentData.portfolio)
            }
            availableCash={
              currentData.positions.find((p) => p.isCash)?.amount || 0
            }
          />
        )}

        {/* Performance Chart */}
        <PerformanceChart
          data={performanceData}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />

        {/* Asset Allocation (Full Width) */}
        <div style={{ marginBottom: "32px" }}>
          <AssetAllocation data={currentData.allocation} />
        </div>

        {/* Holdings Table */}
        <HoldingsTable
          data={currentData.positions}
          onClosePosition={
            activeTab !== "summary"
              ? (id) => handleClosePosition(id, currentData.portfolio)
              : null
          }
        />

        {/* Position History */}
        <PositionHistory data={currentData.history} />
      </div>
    </div>
  );
}

export default App;
