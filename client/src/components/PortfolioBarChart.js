import { useQuery } from '@apollo/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import { GET_ME } from '../utils/queries';
import useAuth from '../hooks/useAuth';

const sectors = [
  'Basic Materials','Consumer Discretionary','Consumer Staples','Energy','Financials',
  'Healthcare','Industrials','Real Estate','Technology','Telecommunications','Utilities',
];

export default function PortfolioBarChart() {
  const loggedIn          = useAuth();
  const { data, loading } = useQuery(GET_ME, { skip: !loggedIn });

  if (!loggedIn || loading || !data) return null;

  /* ── 1 · aggregate value per sector ─────────────────────────── */
  const totalsBySector = Object.fromEntries(sectors.map(s => [s, 0]));
  data.me.portfolio.forEach(p => {
    const holdingValue = p.shares * p.valueUSD;     // total dollars for that stock
    totalsBySector[p.sector] += holdingValue;
  });

  /* ── 2 · compute grand total & percentages ──────────────────── */
  const grandTotal = Object.values(totalsBySector).reduce((a,b) => a+b, 0);

  /* prepare array for recharts */
  const chartData = sectors.map(s => ({
    sector: s,
    usd:    totalsBySector[s],
    pct:    grandTotal ? ((totalsBySector[s] / grandTotal) * 100).toFixed(1) : 0,
  }));

  /* ── 3 · render ─────────────────────────────────────────────── */
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <XAxis
            dataKey="sector"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
            tickLine={false}
            tickFormatter={(s, idx) => `${s}\n(${chartData[idx].pct}%)`}
          />
          <YAxis
            tickFormatter={v => `$${v.toLocaleString()}`}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => `$${value.toLocaleString()}`}
            labelFormatter={(label, payload) => `${label} — ${payload[0]?.payload.pct}%`}
          />
          <Bar dataKey="usd" fill="#0d6efd">
            {/* value labels on top of bars */}
            <LabelList
              dataKey="usd"
              position="top"
              formatter={v => v ? `$${v.toLocaleString()}` : ''}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
