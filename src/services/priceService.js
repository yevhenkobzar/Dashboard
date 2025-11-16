const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Map common symbols to CoinGecko IDs
const SYMBOL_TO_ID = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  AVAX: "avalanche-2",
  DOGE: "dogecoin",
  DOT: "polkadot",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  NEAR: "near",
  AAVE: "aave",
  FIL: "filecoin",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  INJ: "injective-protocol",
  SUI: "sui",
  STX: "blockstack",
};

// Get CoinGecko ID from symbol
export const getCoinId = (symbol) => {
  return SYMBOL_TO_ID[symbol.toUpperCase()] || symbol.toLowerCase();
};

// Fetch current prices for multiple coins
export const fetchPrices = async (symbols) => {
  try {
    // Filter out CASH and get unique symbols
    const cryptoSymbols = [...new Set(symbols.filter((s) => s !== "CASH"))];

    if (cryptoSymbols.length === 0) {
      return {};
    }

    // Convert symbols to CoinGecko IDs
    const ids = cryptoSymbols.map((symbol) => getCoinId(symbol)).join(",");

    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch prices");
    }

    const data = await response.json();

    // Convert back to symbol-based object
    const prices = {};
    cryptoSymbols.forEach((symbol) => {
      const id = getCoinId(symbol);
      if (data[id]) {
        prices[symbol] = {
          price: data[id].usd,
          change24h: data[id].usd_24h_change || 0,
        };
      }
    });

    return prices;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return {};
  }
};

// Search for a coin by name or symbol
export const searchCoin = async (query) => {
  try {
    const response = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Failed to search coins");
    }

    const data = await response.json();
    return data.coins.slice(0, 10).map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
    }));
  } catch (error) {
    console.error("Error searching coins:", error);
    return [];
  }
};
