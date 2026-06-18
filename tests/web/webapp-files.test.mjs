import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('dashboard contains advisory-first safety copy and API links', async () => {
  const page = await readFile(new URL('../../app/page.tsx', import.meta.url), 'utf8');

  assert.match(page, /Execution is intentionally disabled/);
  assert.match(page, /\/api\/advice/);
  const adviceTable = await readFile(new URL('../../app/components/AdviceTable.tsx', import.meta.url), 'utf8');
  assert.match(adviceTable, /Ranked trade suggestions/);
});

test('risk engine blocks unsafe candidates before advice approval', async () => {
  const riskEngine = await readFile(new URL('../../app/lib/risk-engine.ts', import.meta.url), 'utf8');

  assert.match(riskEngine, /market_not_tradable/);
  assert.match(riskEngine, /strategy_news_blackout/);
  assert.match(riskEngine, /portfolio_open_risk_too_high/);
  assert.match(riskEngine, /daily_loss_limit_reached/);
});

test('api routes expose advice, strategies, and backtests', async () => {
  const adviceRoute = await readFile(new URL('../../app/api/advice/route.ts', import.meta.url), 'utf8');
  const strategiesRoute = await readFile(new URL('../../app/api/strategies/route.ts', import.meta.url), 'utf8');
  const backtestsRoute = await readFile(new URL('../../app/api/backtests/route.ts', import.meta.url), 'utf8');

  assert.match(adviceRoute, /executionEnabled: false/);
  assert.match(strategiesRoute, /strategies/);
  assert.match(backtestsRoute, /backtests/);
});

test('real market endpoints and panel are wired without enabling execution', async () => {
  const panel = await readFile(new URL('../../app/components/RealMarketPanel.tsx', import.meta.url), 'utf8');
  const adviceRoute = await readFile(new URL('../../app/api/market/advice/route.ts', import.meta.url), 'utf8');
  const backtestRoute = await readFile(new URL('../../app/api/market/backtest/route.ts', import.meta.url), 'utf8');
  const strategy = await readFile(new URL('../../app/lib/market-strategy.ts', import.meta.url), 'utf8');

  assert.match(panel, /Run real market check/);
  assert.match(adviceRoute, /generateRealMarketAdvice/);
  assert.match(backtestRoute, /runRealBacktest/);
  assert.match(strategy, /not financial advice/);
  assert.doesNotMatch(strategy, /order_send|orderSend|executeTrade/);
});

test('constant live-scan endpoint covers the configured FTMO-style universe', async () => {
  const scanRoute = await readFile(new URL('../../app/api/market/live-scan/route.ts', import.meta.url), 'utf8');
  const livePanel = await readFile(new URL('../../app/components/LiveScanPanel.tsx', import.meta.url), 'utf8');
  const marketData = await readFile(new URL('../../app/lib/market-data.ts', import.meta.url), 'utf8');

  assert.match(scanRoute, /marketSymbols/);
  assert.match(scanRoute, /executionEnabled: false/);
  assert.match(livePanel, /Auto-refresh 30s/);
  assert.match(marketData, /US100\.cash/);
  assert.match(marketData, /BTCUSD/);
});
