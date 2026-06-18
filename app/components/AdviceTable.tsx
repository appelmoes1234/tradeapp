import type { AdviceOutput } from '../lib/domain';

export function AdviceTable({ advice }: { advice: AdviceOutput[] }) {
  return (
    <section className="panel wide">
      <div className="panel-heading">
        <p className="eyebrow">Live scanner</p>
        <h2>Ranked trade suggestions</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Market</th>
              <th>Strategy</th>
              <th>Side</th>
              <th>Entry / SL / TP</th>
              <th>RR</th>
              <th>Lots</th>
              <th>Risk</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {advice.map((item) => (
              <tr key={item.id} className={item.decision.status}>
                <td><span className="pill">{item.decision.status}</span></td>
                <td>{item.symbol}</td>
                <td>{item.strategy.name}</td>
                <td>{item.side.toUpperCase()}</td>
                <td>{item.entry} / {item.stopLoss} / {item.takeProfit}</td>
                <td>{item.rr.toFixed(1)}</td>
                <td>{item.decision.lotSize}</td>
                <td>${item.decision.riskUsd.toLocaleString()}</td>
                <td>{item.decision.reasonCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
