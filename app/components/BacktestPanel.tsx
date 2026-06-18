import type { BacktestSummary } from '../lib/backtests';
import { getStrategy } from '../lib/strategies';

export function BacktestPanel({ summaries }: { summaries: BacktestSummary[] }) {
  return (
    <section className="panel wide">
      <div className="panel-heading">
        <p className="eyebrow">Event-driven backtest</p>
        <h2>FTMO pass/fail summary</h2>
      </div>
      <div className="backtest-grid">
        {summaries.map((summary) => (
          <article className="backtest-card" key={`${summary.strategyId}-${summary.market}`}>
            <h3>{getStrategy(summary.strategyId).name}</h3>
            <p className="muted">{summary.market}</p>
            <dl>
              <div><dt>Trades</dt><dd>{summary.trades}</dd></div>
              <div><dt>Winrate</dt><dd>{summary.winRate}%</dd></div>
              <div><dt>Expectancy</dt><dd>${summary.expectancy}</dd></div>
              <div><dt>PnL</dt><dd>${summary.pnl.toLocaleString()}</dd></div>
              <div><dt>Max DD</dt><dd>${summary.maxDrawdown.toLocaleString()}</dd></div>
              <div><dt>FTMO</dt><dd>{summary.ftmoPass ? 'Pass' : 'Fail'}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
