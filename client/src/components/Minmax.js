import React, { useState } from 'react';
import { Form, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import RAW_SYMBOLS from '../data/symbols.json';
import Auth from '../utils/auth';

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

  /* ── helpers (copied verbatim from Home.js) ──── */
  const addLog  = msg => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  const delay   = ms  => new Promise(r => setTimeout(r, ms));

  const hitLimit = async () => { /* … unchanged … */ };
  const safeGet  = async (url, symbol, tag) => { /* … unchanged … */ };
  const fetchSeries = async s => { /* … unchanged … */ };
  const fetchName   = async s => { /* … unchanged … */ };
  const getPastDate = (y, m = 0) => { /* … unchanged … */ };
  const median      = arr => { /* … unchanged … */ };
  const analyse     = async symbol => { /* … unchanged … */ };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!apiKey) return setError('Please enter a valid Alpha Vantage API key.');
    /* … unchanged core logic … */
  };

  const formatValue   = (v,d=4)=>v==null?'N/A':v.toFixed(d);
  const formatPercent = v=>v==null?'N/A':`${v.toFixed(2)}%`;
  const formatInt     = v=>v==null?'N/A':v;

  /* ── RENDER ──────────────────────────────────── */
  if (!Auth.loggedIn()) return <Alert variant="info">Log in to run Min–Max analysis.</Alert>;

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
              <tr key={r.symbol}>
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

      <h3 className="mt-5">API Call Logs</h3>
      {logs.length === 0 ? (
        <p>No logs yet. Submit an API key to start analysis.</p>
      ) : (
        logs.map((log, i) => <div key={i}><code>{log}</code></div>)
      )}
    </>
  );
}
