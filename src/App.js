import React, { useState, useEffect } from "react";
import "./App1.css";
import PriceUpdater from "./components/PriceUpdater";
import PerformanceChart from "./components/PerformanceChart";
import SummaryCards from "./components/SummaryCards";
import AssetAllocation from "./components/AssetAllocation";
import HoldingsTable from "./components/HoldingsTable";
import AddPositionForm from "./components/AddPositionForm";
import PositionHistory from "./components/PositionHistory";

function App() {
  const [activeTab, setActiveTab] = useState("summary"); // 'summary', 'liquid', 'liquid2'
  const [timeframe, setTimeframe] = useState("1M");

  // LIQUID PORTFOLIO DATA

  // Load data from localStorage or use defaults
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return defaultValue;
    }
  };

   // Default positions - Starting fresh with only cash
  const defaultLiquidPositions = [
    {
      id: "cash-liquid",
      symbol: "CASH",
      name: "Cash (USD)",
      entryPrice: 1,
      currentPrice: 1,
      amount: 0,
      invested: 0,
      note: "Available cash",
      isCash: true,
    },
  ];

  const defaultLiquidHistory = [];

  const defaultLiquid2Positions = [
    {
      id: "cash-liquid2",
      symbol: "CASH",
      name: "Cash (USD)",
      entryPrice: 1,
      currentPrice: 1,
      amount: 0,
      invested: 0,
      note: "Available cash",
      isCash: true,
    },
  ];

  const defaultLiquid2History = [];


  // LIQUID PORTFOLIO DATA with localStorage
  const [liquidPositions, setLiquidPositions] = useState(() =>
    loadFromStorage("monolith_liquid_positions", defaultLiquidPositions)
  );
  const [liquidHistory, setLiquidHistory] = useState(() =>
    loadFromStorage("monolith_liquid_history", defaultLiquidHistory)
  );

  // LIQUID 2 PORTFOLIO DATA with localStorage
  const [liquid2Positions, setLiquid2Positions] = useState(() =>
    loadFromStorage("monolith_liquid2_positions", defaultLiquid2Positions)
  );
  const [liquid2History, setLiquid2History] = useState(() =>
    loadFromStorage("monolith_liquid2_history", defaultLiquid2History)
  );

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "monolith_liquid_positions",
        JSON.stringify(liquidPositions)
      );
    } catch (error) {
      console.error("Error saving liquid positions:", error);
    }
  }, [liquidPositions]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "monolith_liquid_history",
        JSON.stringify(liquidHistory)
      );
    } catch (error) {
      console.error("Error saving liquid history:", error);
    }
  }, [liquidHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "monolith_liquid2_positions",
        JSON.stringify(liquid2Positions)
      );
    } catch (error) {
      console.error("Error saving liquid2 positions:", error);
    }
  }, [liquid2Positions]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "monolith_liquid2_history",
        JSON.stringify(liquid2History)
      );
    } catch (error) {
      console.error("Error saving liquid2 history:", error);
    }
  }, [liquid2History]);
  // Calculate portfolio metrics from positions
  const calculateMetrics = (positions) => {
    const totalInvested = positions.reduce((sum, p) => sum + p.invested, 0);
    const currentValue = positions.reduce(
      (sum, p) => sum + p.amount * p.currentPrice,
      0
    );
    const totalGain = currentValue - totalInvested;
    const gainPercentage = (totalGain / totalInvested) * 100;

    // Find best performer
    const positionsWithReturns = positions.map((p) => ({
      symbol: p.symbol,
      return: ((p.currentPrice - p.entryPrice) / p.entryPrice) * 100,
    }));
    const bestPerformer = positionsWithReturns.reduce(
      (best, current) => (current.return > best.return ? current : best),
      { symbol: "", return: 0 }
    );

    return {
      totalValue: currentValue,
      totalGain: totalGain,
      gainPercentage: gainPercentage,
      dayChange: currentValue * 0.01, // Mock day change
      dayChangePercentage: 1.01,
      bestPerformer: bestPerformer,
      totalAssets: positions.length,
      assetCategories: 4,
    };
  };

  const liquidMetrics = calculateMetrics(liquidPositions);
  const liquid2Metrics = calculateMetrics(liquid2Positions);

  // Performance data - keeping mock data for now
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
      100,
    dayChange: liquidMetrics.dayChange + liquid2Metrics.dayChange,
    dayChangePercentage: 1.01,
    bestPerformer:
      liquidMetrics.bestPerformer.return > liquid2Metrics.bestPerformer.return
        ? liquidMetrics.bestPerformer
        : liquid2Metrics.bestPerformer,
    totalAssets: liquidPositions.length + liquid2Positions.length,
    assetCategories: 5,
  };

  // Add position handlers
  // Add position handlers
  const handleAddPosition = (newPosition, portfolio) => {
    const investmentAmount = newPosition.entryPrice * newPosition.amount;

    const position = {
      ...newPosition,
      id: Date.now(),
      invested: investmentAmount,
    };

    if (portfolio === "liquid") {
      // Deduct from cash
      const updatedPositions = liquidPositions.map((p) => {
        if (p.isCash) {
          return {
            ...p,
            amount: p.amount - investmentAmount,
            invested: p.invested - investmentAmount,
          };
        }
        return p;
      });
      setLiquidPositions([...updatedPositions, position]);
    } else {
      // Deduct from cash
      const updatedPositions = liquid2Positions.map((p) => {
        if (p.isCash) {
          return {
            ...p,
            amount: p.amount - investmentAmount,
            invested: p.invested - investmentAmount,
          };
        }
        return p;
      });
      setLiquid2Positions([...updatedPositions, position]);
    }
  };

  const handleAddCash = (amount, portfolio) => {
    if (portfolio === "liquid") {
      const updatedPositions = liquidPositions.map((p) => {
        if (p.isCash) {
          return {
            ...p,
            amount: p.amount + amount,
            invested: p.invested + amount,
          };
        }
        return p;
      });
      setLiquidPositions(updatedPositions);
    } else {
      const updatedPositions = liquid2Positions.map((p) => {
        if (p.isCash) {
          return {
            ...p,
            amount: p.amount + amount,
            invested: p.invested + amount,
          };
        }
        return p;
      });
      setLiquid2Positions(updatedPositions);
    }
  };

  const handleClosePosition = (positionId, portfolio) => {
    if (portfolio === "liquid") {
      const position = liquidPositions.find((p) => p.id === positionId);
      if (position) {
        const exitValue = position.amount * position.currentPrice;
        const closedPosition = {
          ...position,
          exitPrice: position.currentPrice,
          pnl: (position.currentPrice - position.entryPrice) * position.amount,
          closedDate: new Date().toISOString().split("T")[0],
        };

        // Add to history
        setLiquidHistory([closedPosition, ...liquidHistory]);

        // Update cash position
        const updatedPositions = liquidPositions
          .map((p) => {
            if (p.isCash) {
              return {
                ...p,
                amount: p.amount + exitValue,
                invested: p.invested + exitValue,
              };
            }
            return p;
          })
          .filter((p) => p.id !== positionId);

        setLiquidPositions(updatedPositions);
      }
    } else {
      const position = liquid2Positions.find((p) => p.id === positionId);
      if (position) {
        const exitValue = position.amount * position.currentPrice;
        const closedPosition = {
          ...position,
          exitPrice: position.currentPrice,
          pnl: (position.currentPrice - position.entryPrice) * position.amount,
          closedDate: new Date().toISOString().split("T")[0],
        };

        // Add to history
        setLiquid2History([closedPosition, ...liquid2History]);

        // Update cash position
        const updatedPositions = liquid2Positions
          .map((p) => {
            if (p.isCash) {
              return {
                ...p,
                amount: p.amount + exitValue,
                invested: p.invested + exitValue,
              };
            }
            return p;
          })
          .filter((p) => p.id !== positionId);

        setLiquid2Positions(updatedPositions);
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

    // For summary - combine positions and merge cash
    const liquidCash = liquidPositions.find((p) => p.isCash);
    const liquid2Cash = liquid2Positions.find((p) => p.isCash);
    const combinedCashAmount =
      (liquidCash?.amount || 0) + (liquid2Cash?.amount || 0);

    // Create combined cash position
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

    // Get non-cash positions from both portfolios
    const nonCashPositions = [
      ...liquidPositions.filter((p) => !p.isCash),
      ...liquid2Positions.filter((p) => !p.isCash),
    ];

    // Combine: cash first, then other positions
    const combinedPositions = [combinedCash, ...nonCashPositions];

    return {
      metrics: summaryMetrics,
      allocation: combinedAllocation,
      positions: combinedPositions,
      history: [...liquidHistory, ...liquid2History],
      portfolio: "summary",
    };
  };

  // Export/Import/Reset functions
  const handleExportData = () => {
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
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.liquidPositions) setLiquidPositions(data.liquidPositions);
        if (data.liquidHistory) setLiquidHistory(data.liquidHistory);
        if (data.liquid2Positions) setLiquid2Positions(data.liquid2Positions);
        if (data.liquid2History) setLiquid2History(data.liquid2History);

        alert("Portfolio data imported successfully!");
      } catch (error) {
        alert("Error importing data. Please check the file format.");
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        "⚠️ Are you sure you want to reset ALL portfolio data? This cannot be undone!"
      )
    ) {
      if (
        window.confirm(
          "⚠️ FINAL WARNING: This will delete all positions and history. Continue?"
        )
      ) {
        setLiquidPositions(defaultLiquidPositions);
        setLiquidHistory(defaultLiquidHistory);
        setLiquid2Positions(defaultLiquid2Positions);
        setLiquid2History(defaultLiquid2History);
        alert("Portfolio data has been reset to defaults.");
      }
    }
  };

  const handlePricesUpdate = (prices) => {
    // Update liquid positions
    const updatedLiquidPositions = liquidPositions.map((position) => {
      if (position.isCash) return position;

      const priceData = prices[position.symbol];
      if (priceData) {
        return {
          ...position,
          currentPrice: priceData.price,
          change24h: priceData.change24h,
        };
      }
      return position;
    });
    setLiquidPositions(updatedLiquidPositions);

    // Update liquid2 positions
    const updatedLiquid2Positions = liquid2Positions.map((position) => {
      if (position.isCash) return position;

      const priceData = prices[position.symbol];
      if (priceData) {
        return {
          ...position,
          currentPrice: priceData.price,
          change24h: priceData.change24h,
        };
      }
      return position;
    });
    setLiquid2Positions(updatedLiquid2Positions);
  };

  const currentData = getCurrentData();

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
              <label className="btn-control" title="Import portfolio data">
                📤 Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: "none" }}
                />
              </label>
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
