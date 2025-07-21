import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import sectors from '../data/sectors';

export default function TargetSectorBarChart({ actual, target }) {
  const data = sectors.map((s, i) => ({
    sector: s,
    Actual: actual[i] ?? 0,
    Target: target[i] ?? 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
        <YAxis unit="%" />
        <Tooltip />
        <Legend />
        <Bar dataKey="Actual" fill="#3b82f6" />
        <Bar dataKey="Target" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
