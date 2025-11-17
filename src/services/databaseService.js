import { supabase } from "./supabaseClient";

// Fetch all positions for a portfolio
export const fetchPositions = async (portfolio) => {
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .eq("portfolio", portfolio);

  if (error) {
    console.error("Error fetching positions:", error);
    return [];
  }

  return data || [];
};

// Fetch history for a portfolio
export const fetchHistory = async (portfolio) => {
  const { data, error } = await supabase
    .from("position_history")
    .select("*")
    .eq("portfolio", portfolio)
    .order("closed_date", { ascending: false });

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }

  return data || [];
};

// Add a new position
export const addPosition = async (position, portfolio) => {
  const { data, error } = await supabase
    .from("positions")
    .insert([
      {
        id: position.id,
        portfolio: portfolio,
        symbol: position.symbol,
        name: position.name,
        entry_price: parseFloat(position.entryPrice),
        current_price: parseFloat(position.currentPrice),
        amount: parseFloat(position.amount),
        invested: parseFloat(position.invested),
        note: position.note || "",
        is_cash: position.isCash || false,
        change_24h: position.change24h ? parseFloat(position.change24h) : 0,
      },
    ])
    .select();

  if (error) {
    console.error("Error adding position:", error);
    throw error;
  }

  return data;
};

// Update a position (for price updates or cash changes)
export const updatePosition = async (positionId, updates) => {
  const dbUpdates = {};
  if (updates.currentPrice !== undefined)
    dbUpdates.current_price = parseFloat(updates.currentPrice);
  if (updates.change24h !== undefined)
    dbUpdates.change_24h = parseFloat(updates.change24h);
  if (updates.amount !== undefined)
    dbUpdates.amount = parseFloat(updates.amount);
  if (updates.invested !== undefined)
    dbUpdates.invested = parseFloat(updates.invested);

  const { data, error } = await supabase
    .from("positions")
    .update(dbUpdates)
    .eq("id", positionId)
    .select();

  if (error) {
    console.error("Error updating position:", error);
    throw error;
  }

  return data;
};

// Delete a position
export const deletePosition = async (positionId) => {
  const { error } = await supabase
    .from("positions")
    .delete()
    .eq("id", positionId);

  if (error) {
    console.error("Error deleting position:", error);
    throw error;
  }
};

// Add to history
export const addToHistory = async (position, portfolio) => {
  const { data, error } = await supabase
    .from("position_history")
    .insert([
      {
        id: position.id.toString(),
        portfolio: portfolio,
        symbol: position.symbol,
        name: position.name,
        entry_price: parseFloat(position.entryPrice),
        exit_price: parseFloat(position.exitPrice),
        amount: parseFloat(position.amount),
        invested: parseFloat(position.invested),
        pnl: parseFloat(position.pnl),
        note: position.note || "",
        closed_date: position.closedDate,
      },
    ])
    .select();

  if (error) {
    console.error("Error adding to history:", error);
    throw error;
  }

  return data;
};

// Initialize default positions (only if none exist)
export const initializePortfolio = async (portfolio) => {
  const existing = await fetchPositions(portfolio);

  if (existing.length === 0) {
    // Add initial cash position
    await addPosition(
      {
        id: `cash-${portfolio}`,
        symbol: "CASH",
        name: "Cash (USD)",
        entryPrice: 1,
        currentPrice: 1,
        amount: 0,
        invested: 0,
        note: "Available cash",
        isCash: true,
      },
      portfolio
    );
  }
};
