import React, { useState } from "react";
import { PlusCircle, DollarSign, MinusCircle } from "lucide-react";

const AddPositionForm = ({
  onAddPosition,
  onAddCash,
  onRemoveCash,
  availableCash,
}) => {
  const [showCashModal, setShowCashModal] = useState(false);
  const [showRemoveCashModal, setShowRemoveCashModal] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [removeCashAmount, setRemoveCashAmount] = useState("");

  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    entryPrice: "",
    currentPrice: "",
    amount: "",
    note: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.symbol ||
      !formData.entryPrice ||
      !formData.currentPrice ||
      !formData.amount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const investmentAmount =
      parseFloat(formData.entryPrice) * parseFloat(formData.amount);

    // Check if enough cash available
    if (investmentAmount > availableCash) {
      alert(
        `Not enough capital! You need $${investmentAmount.toFixed(
          2
        )} but only have $${availableCash.toFixed(2)} available.`
      );
      return;
    }

    onAddPosition({
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || formData.symbol.toUpperCase(),
      entryPrice: parseFloat(formData.entryPrice),
      currentPrice: parseFloat(formData.currentPrice),
      amount: parseFloat(formData.amount),
      note: formData.note,
    });

    // Reset form
    setFormData({
      symbol: "",
      name: "",
      entryPrice: "",
      currentPrice: "",
      amount: "",
      note: "",
    });
  };

  const handleAddCash = () => {
    const amount = parseFloat(cashAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    onAddCash(amount);
    setCashAmount("");
    setShowCashModal(false);
  };

  const handleRemoveCash = () => {
    const amount = parseFloat(removeCashAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount > availableCash) {
      alert(
        `Cannot remove $${amount.toFixed(2)}. Only $${availableCash.toFixed(
          2
        )} available.`
      );
      return;
    }

    onRemoveCash(amount);
    setRemoveCashAmount("");
    setShowRemoveCashModal(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateInvestment = () => {
    const entryPrice = parseFloat(formData.entryPrice) || 0;
    const amount = parseFloat(formData.amount) || 0;
    return entryPrice * amount;
  };

  const investment = calculateInvestment();

  return (
    <div className="card" style={{ marginBottom: "32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          className="chart-title"
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <PlusCircle size={24} color="#3b82f6" />
          Add New Position
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              Available Cash
            </div>
            <div
              style={{ color: "#10b981", fontSize: "20px", fontWeight: "bold" }}
            >
              ${availableCash.toFixed(2)}
            </div>
          </div>
          <button
            type="button"
            className="btn-add-cash"
            onClick={() => setShowCashModal(true)}
          >
            <DollarSign size={18} />
            Add Cash
          </button>
          <button
            type="button"
            className="btn-remove-cash"
            onClick={() => setShowRemoveCashModal(true)}
          >
            <MinusCircle size={18} />
            Remove Cash
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-position-form">
        <div className="form-row">
          <div className="form-group">
            <label>Symbol *</label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="BTC"
              required
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Bitcoin"
            />
          </div>
          <div className="form-group">
            <label>Entry Price *</label>
            <input
              type="number"
              name="entryPrice"
              value={formData.entryPrice}
              onChange={handleChange}
              placeholder="28500"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Current Price *</label>
            <input
              type="number"
              name="currentPrice"
              value={formData.currentPrice}
              onChange={handleChange}
              placeholder="40500"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="10.5"
              step="0.00000001"
              required
            />
          </div>
          <div className="form-group">
            <label>Note</label>
            <input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Optional note"
            />
          </div>
        </div>

        {investment > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "#94a3b8" }}>Investment Required:</span>
            <span
              style={{
                color: investment > availableCash ? "#ef4444" : "#10b981",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              ${investment.toFixed(2)}
            </span>
          </div>
        )}

        <button type="submit" className="btn-primary">
          <PlusCircle size={18} />
          Add Position
        </button>
      </form>

      {/* Add Cash Modal */}
      {showCashModal && (
        <div className="modal-overlay" onClick={() => setShowCashModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                color: "white",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <DollarSign size={24} color="#10b981" />
              Add Cash to Portfolio
            </h3>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>Amount (USD)</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="10000"
                step="0.01"
                min="0.01"
                autoFocus
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowCashModal(false);
                  setCashAmount("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddCash}
              >
                <DollarSign size={18} />
                Add Cash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Cash Modal */}
      {showRemoveCashModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRemoveCashModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                color: "white",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MinusCircle size={24} color="#ef4444" />
              Remove Cash from Portfolio
            </h3>
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                Available Cash
              </div>
              <div
                style={{
                  color: "#10b981",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                ${availableCash.toFixed(2)}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>Amount to Remove (USD)</label>
              <input
                type="number"
                value={removeCashAmount}
                onChange={(e) => setRemoveCashAmount(e.target.value)}
                placeholder="5000"
                step="0.01"
                min="0.01"
                max={availableCash}
                autoFocus
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowRemoveCashModal(false);
                  setRemoveCashAmount("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-solid"
                onClick={handleRemoveCash}
              >
                <MinusCircle size={18} />
                Remove Cash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPositionForm;
