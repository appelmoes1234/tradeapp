import type { StrategyConfig } from '../lib/domain';

export function StrategyCards({ strategies }: { strategies: StrategyConfig[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Strategy registry</p>
        <h2>Research-backed rules</h2>
      </div>
      <div className="strategy-list">
        {strategies.map((strategy) => (
          <article className="strategy-card" key={strategy.id}>
            <div>
              <h3>{strategy.name}</h3>
              <p>{strategy.description}</p>
            </div>
            <div className="tags">
              <span>{strategy.timeframes.signal}</span>
              <span>{strategy.risk.riskPerTradePct}% risk</span>
              <span>RR ≥ {strategy.risk.minRr}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
