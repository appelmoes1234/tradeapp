import { AdviceTable } from './components/AdviceTable';
import { BacktestPanel } from './components/BacktestPanel';
import { ChartPanel } from './components/ChartPanel';
import { LiveScanPanel } from './components/LiveScanPanel';
import { RealMarketPanel } from './components/RealMarketPanel';
import { StatusCard } from './components/StatusCard';
import { StrategyCards } from './components/StrategyCards';
import { backtestSummaries } from './lib/backtests';
import { buildAdviceOutputs, calculateFtmoLimits } from './lib/risk-engine';
import { defaultProfile, symbolRegistry, tradeCandidates } from './lib/mock-data';
import { strategies } from './lib/strategies';

export default function Home() {
  const advice = buildAdviceOutputs(tradeCandidates, defaultProfile, symbolRegistry);
  const approved = advice.filter((item) => item.decision.status === 'approved');
  const blocked = advice.filter((item) => item.decision.status === 'blocked');
  const limits = calculateFtmoLimits(defaultProfile);

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">FTMO-constrained advisory platform</p>
          <h1>Trading advice that is designed to say no first.</h1>
          <p className="hero-copy">
            Advisory-only dashboard with strategy rules, symbol registry, live scanner mock data,
            backtest summaries and a portfolio-wide FTMO Risk Engine. Execution is intentionally disabled.
          </p>
          <div className="hero-actions">
            <a href="/api/advice">View advice API</a>
            <a href="/api/strategies">View strategies API</a>
          </div>
        </div>
        <aside className="risk-box">
          <span>Execution</span>
          <strong>OFF</strong>
          <p>Order routing requires a separate local MT5 bridge and fresh risk check. Not enabled in this MVP.</p>
        </aside>
      </section>

      <section className="status-grid">
        <StatusCard label="Approved advice" value={String(approved.length)} detail="Candidates that survived all hard gates." tone="good" />
        <StatusCard label="Blocked" value={String(blocked.length)} detail="Signals rejected with auditable reasons." tone="warn" />
        <StatusCard label="Daily buffer" value={`$${limits.remainingDailyBufferUsd.toLocaleString()}`} detail="Equity-based remaining FTMO daily buffer." tone="good" />
        <StatusCard label="Total buffer" value={`$${limits.remainingTotalBufferUsd.toLocaleString()}`} detail="Static/trailing max-loss buffer by profile." tone="neutral" />
      </section>

      <section className="layout-grid">
        <StrategyCards strategies={strategies} />
        <ChartPanel />
      </section>

      <AdviceTable advice={advice} />
      <RealMarketPanel />
      <LiveScanPanel />
      <BacktestPanel summaries={backtestSummaries} />
    </main>
  );
}
