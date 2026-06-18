export type MarketBar = {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketSymbol = {
  label: string;
  yahooSymbol: string;
  platformSymbol: string;
  assetClass: 'forex' | 'indices' | 'metals' | 'commodities' | 'crypto' | 'stocks';
  ftmoCategory: string;
  tradingViewSymbol: string;
  dataSource: 'yahoo_public_proxy' | 'tradingview_websocket';
  syntheticInverseOf?: string;
};

export const marketSymbols: MarketSymbol[] = [
  { label: 'EUR/USD', yahooSymbol: 'EURUSD=X', tradingViewSymbol: 'OANDA:EURUSD', platformSymbol: 'EURUSD', assetClass: 'forex', ftmoCategory: 'Forex majors', dataSource: 'tradingview_websocket' },
  { label: 'USD/EUR', yahooSymbol: 'USDEUR=X', tradingViewSymbol: 'OANDA:EURUSD', platformSymbol: 'USDEUR', assetClass: 'forex', ftmoCategory: 'Forex majors', dataSource: 'tradingview_websocket', syntheticInverseOf: 'EURUSD=X' },
  { label: 'GBP/USD', yahooSymbol: 'GBPUSD=X', tradingViewSymbol: 'OANDA:GBPUSD', platformSymbol: 'GBPUSD', assetClass: 'forex', ftmoCategory: 'Forex majors', dataSource: 'tradingview_websocket' },
  { label: 'USD/JPY', yahooSymbol: 'JPY=X', tradingViewSymbol: 'OANDA:USDJPY', platformSymbol: 'USDJPY', assetClass: 'forex', ftmoCategory: 'Forex majors', dataSource: 'tradingview_websocket' },
  { label: 'EUR/GBP', yahooSymbol: 'EURGBP=X', tradingViewSymbol: 'OANDA:EURGBP', platformSymbol: 'EURGBP', assetClass: 'forex', ftmoCategory: 'Forex crosses', dataSource: 'tradingview_websocket' },
  { label: 'Gold', yahooSymbol: 'GC=F', tradingViewSymbol: 'OANDA:XAUUSD', platformSymbol: 'XAUUSD', assetClass: 'metals', ftmoCategory: 'Metals', dataSource: 'tradingview_websocket' },
  { label: 'Silver', yahooSymbol: 'SI=F', tradingViewSymbol: 'OANDA:XAGUSD', platformSymbol: 'XAGUSD', assetClass: 'metals', ftmoCategory: 'Metals', dataSource: 'tradingview_websocket' },
  { label: 'Nasdaq 100 CFD', yahooSymbol: 'NQ=F', tradingViewSymbol: 'CAPITALCOM:US100', platformSymbol: 'US100.cash', assetClass: 'indices', ftmoCategory: 'Indices', dataSource: 'tradingview_websocket' },
  { label: 'S&P 500 CFD', yahooSymbol: 'ES=F', tradingViewSymbol: 'CAPITALCOM:US500', platformSymbol: 'US500.cash', assetClass: 'indices', ftmoCategory: 'Indices', dataSource: 'tradingview_websocket' },
  { label: 'Dow Jones CFD', yahooSymbol: 'YM=F', tradingViewSymbol: 'CAPITALCOM:US30', platformSymbol: 'US30.cash', assetClass: 'indices', ftmoCategory: 'Indices', dataSource: 'tradingview_websocket' },
  { label: 'Crude oil CFD', yahooSymbol: 'CL=F', tradingViewSymbol: 'TVC:USOIL', platformSymbol: 'USOIL.cash', assetClass: 'commodities', ftmoCategory: 'Energies', dataSource: 'tradingview_websocket' },
  { label: 'Bitcoin', yahooSymbol: 'BTC-USD', tradingViewSymbol: 'BINANCE:BTCUSDT', platformSymbol: 'BTCUSD', assetClass: 'crypto', ftmoCategory: 'Crypto', dataSource: 'tradingview_websocket' },
  { label: 'Ethereum', yahooSymbol: 'ETH-USD', tradingViewSymbol: 'BINANCE:ETHUSDT', platformSymbol: 'ETHUSD', assetClass: 'crypto', ftmoCategory: 'Crypto', dataSource: 'tradingview_websocket' },
  { label: 'AMD', yahooSymbol: 'AMD', tradingViewSymbol: 'NASDAQ:AMD', platformSymbol: 'AMD', assetClass: 'stocks', ftmoCategory: 'Stock CFDs', dataSource: 'tradingview_websocket' },
  { label: 'ASML ADR', yahooSymbol: 'ASML', tradingViewSymbol: 'NASDAQ:ASML', platformSymbol: 'ASML', assetClass: 'stocks', ftmoCategory: 'Stock CFDs', dataSource: 'tradingview_websocket' }
];

export function getMarketSymbol(symbolId: string): MarketSymbol {
  const symbol = marketSymbols.find((item) => (
    item.yahooSymbol === symbolId
    || item.tradingViewSymbol === symbolId
    || item.platformSymbol === symbolId
  ));
  if (!symbol) {
    throw new Error(`Unsupported market symbol: ${symbolId}`);
  }
  return symbol;
}

export function getTradingViewSymbol(symbolId: string): string {
  return getMarketSymbol(symbolId).tradingViewSymbol;
}

export function isSyntheticInverseSymbol(symbolId: string): boolean {
  return Boolean(getMarketSymbol(symbolId).syntheticInverseOf);
}
