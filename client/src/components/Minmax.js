import React, { useState } from 'react';
import { Form, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import RAW_SYMBOLS from '../data/symbols.json';
import Auth from '../utils/auth';
import useAuth from '../hooks/useAuth';

const SYMBOLS = Array.isArray(RAW_SYMBOLS[0]) ? RAW_SYMBOLS.flat() : RAW_SYMBOLS;
const MAX_CALLS_MIN = 75;

export default function Minmax() {
  /* ── local state ─────────────────────────────── */
  const [apiKey, setApiKey]       = useState('');
  const [results, setResults]     = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const [logs, setLogs]           = useState([]);
  const [windowStart, setWindowStart]   = useState(Date.now());
  const [callsInWindow, setCallsInWindow] = useState(0);

  const sectors = ['Basic Materials', 'Consumer Discretionary', 'Consumer Staples', 'Energy', 'Financials', 
    'Healthcare', 'Industrials', 'Real Estate', 'Technology', 'Telecommunications', 'Utilities']

  const addLog = (message) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const delay = ms => new Promise(r => setTimeout(r, ms));

  /* ── helpers (copied verbatim from Home.js) ──── */
   const hitLimit = async () => {

    const elapsed = Date.now() - windowStart;

    if (elapsed < 60_000) {
      const wait = 60_000 - elapsed + 150;
      addLog(`⏳ 75 calls reached – waiting ${Math.ceil(wait/1000)} s…`);
      await delay(wait);
    }
    setWindowStart(Date.now());
    setCallsInWindow(0);
  };
  const safeGet = async (url, symbol, tag) => {
    if (callsInWindow + 1 > MAX_CALLS_MIN) await hitLimit();
    setCallsInWindow(prev => prev + 1);
    try {
      const { data } = await axios.get(url);

      if (data.Note) {
        addLog(`⚠️ Throttle note on ${tag} for ${symbol}. Forcing cool-down…`);
        await hitLimit();
        return null;
      }
      addLog(`✅ Successfully fetched ${tag} for ${symbol}`);
      return data;
    } catch (err) {
      addLog(`❌ Network error (${tag}) for ${symbol}: ${err.message}`);
      return null;
    }
  };

  const fetchSeries = async (symbol) => {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&entitlement=delayed&apikey=${apiKey}`;
    return await safeGet(url, symbol, 'TIME_SERIES');
  };

  const fetchName = async (symbol) => {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
    const data = await safeGet(url, symbol, 'OVERVIEW');
    return data && data.Name ? data.Name : symbol;
  };

  const getPastDate = (y, m = 0) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - y);
    d.setMonth(d.getMonth() - m);
    return d;
  };

  const median = arr => {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    const mid = s.length >>> 1;
    return s.length & 1 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };
  const analyse = async (symbol) => {
    addLog(`🔍 Analyzing ${symbol}`);
    const rawSeries = await fetchSeries(symbol);
    if (!rawSeries) return null;
    const company = await fetchName(symbol);
    const entries = Object.entries(rawSeries["Time Series (Daily)"] || {})
      .map(([d, o]) => ({ date: d, close: +o["4. close"] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!entries.length) {
      addLog(`⚠️ No data entries for ${symbol}`);
      return null;
    }

    const today = new Date();

    const thresholds = {
      '5Y': getPastDate(5),
      '1Y': getPastDate(1),
      '6M': getPastDate(0, 6),
      '3M': getPastDate(0, 3),
      '1M': getPastDate(0, 1)
    };
    const bucketMaxes = [];
    const bucketMins = [];

    for (const [, since] of Object.entries(thresholds)) {
      const slice = entries.filter(e => new Date(e.date) >= since);
      if (!slice.length) continue;
      bucketMaxes.push(slice.reduce((a, c) => c.close > a.close ? c : a));
      bucketMins.push(slice.reduce((a, c) => c.close < a.close ? c : a));
    }
    if (!bucketMaxes.length || !bucketMins.length) {
      addLog(`⚠️ No valid buckets for ${symbol}`);
      return null;
    }
    const medianMax = median(bucketMaxes.map(b => b.close));
    const finalMax = bucketMaxes.reduce((a, c) => Math.abs(c.close - medianMax) < Math.abs(a.close - medianMax) ? c : a);
    const medianMin = median(bucketMins.map(b => b.close));
    const finalMin = bucketMins.reduce((a, c) => Math.abs(c.close - medianMin) < Math.abs(a.close - medianMin) ? c : a);
    const range = finalMax.close - finalMin.close;
    const latest = entries.at(-1).close;
    const ratio = range ? (latest - finalMin.close) / range : null;
    const last30 = entries.slice(-30);
    const ratios = range ? last30.map(e => (e.close - finalMin.close) / range) : [];

    const avg30 = ratios.length ? ratios.reduce((s, r) => s + r, 0) / ratios.length : null;
    const diffSum = ratios.slice(1).reduce((s, r, i) => s + Math.abs(r - ratios[i]), 0);
    const delta = (ratio !== null && avg30 !== null) ? ratio - avg30 : null;
    const alert = (avg30 !== null) ? avg30 * range + finalMin.close : null;

    const rawExp = (alert !== null) ? ((alert - latest) / latest) * 100 : null;
    const expPct = (rawExp !== null && delta > 0) ? -Math.abs(rawExp) : rawExp;

    let crosses = null;
    if (alert !== null && last30.length >= 2) {
      crosses = 0;
      for (let i = 1; i < last30.length; i++) {
        const prev = last30[i - 1].close - alert;
        const curr = last30[i].close - alert;
        if (prev === 0 || curr === 0 || (prev < 0 && curr > 0) || (prev > 0 && curr < 0)) {
          crosses++;
        }
      }
    }
    addLog(`✅ Analysis completed for ${symbol}`);
    return { symbol, name: company, latest, min: finalMin.close, max: finalMax.close, ratio, avg30, delta, alert, expPct, diffSum, crosses };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Please enter a valid Alpha Vantage API key.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setResults([]);
    setLogs([]);
    try {
      const newResults = [];
      for (const s of SYMBOLS) {
        const r = await analyse(s);
        if (r) newResults.push(r);
      }
      if (!newResults.length) {
        setError('No data collected.');
        addLog('⚠️ No data collected for any symbols.');
      } else {
        setResults(newResults.filter(r => r.ratio !== null).sort((a, b) => a.ratio-b.ratio));
        addLog(`📋 Analysis completed. ${newResults.length} symbols processed.`);
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
      addLog(`❌ Fatal error: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const formatValue = (v, decimals = 4) => v === null ? 'N/A' : v.toFixed(decimals);
  const formatPercent = (v) => v === null ? 'N/A' : `${v.toFixed(2)}%`;
  const formatInt = (v) => v === null ? 'N/A' : v;



  /* ── RENDER ──────────────────────────────────── */
  const loggedIn = useAuth();
  if (!loggedIn) return <Alert variant="info">Log in to run Min–Max analysis.</Alert>;

  return (
    <>
        <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-3" controlId="apiKey">
            <Form.Label>Alpha Vantage API Key</Form.Label>
            <Form.Control
            type="text"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Loading…' : 'Analyze Stocks'}
        </Button>
        </Form>

        {error && <Alert variant="danger">{error}</Alert>}

        {results.length > 0 && (
        <Table striped bordered hover responsive>
            {/* table header */}
            <tbody>
            {results.map(r => (
                <tr
                    key={r.symbol}
                    className={
                        r.expPct == null        ? ''
                        : r.expPct > 0          ? 'table-success'
                        : r.expPct < 0          ? 'table-danger'
                        : ''
                    }
                >
                <td>{r.symbol}</td>
                <td>{r.name.length > 28 ? r.name.slice(0,25)+'…' : r.name}</td>
                <td>{formatValue(r.latest,2)}</td>
                <td>{formatValue(r.min,2)}</td>
                <td>{formatValue(r.max,2)}</td>
                <td>{formatValue(r.ratio)}</td>
                <td>{formatValue(r.avg30)}</td>
                <td>{formatValue(r.delta)}</td>
                <td>{formatValue(r.alert)}</td>
                <td>{formatPercent(r.expPct)}</td>
                <td>{formatValue(r.diffSum)}</td>
                <td>{formatInt(r.crosses)}</td>
                </tr>
            ))}
            </tbody>
        </Table>
        )}

        <div className="mt-4">
            <h3>API Call Logs</h3>
            <div
                className="border p-3 bg-light"
                style={{ maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}
            >
                {logs.length === 0 ? (
                <p>No logs yet. Submit an API key to start analysis.</p>
                ) : (
                logs.map((log, index) => (
                    <div key={index} className={log.includes('❌') ? 'text-danger' : log.includes('⚠️') ? 'text-warning' : 'text-success'}>
                    {log}
                    </div>
                ))
                )}
            </div>
        </div>
    </>
  );
}
