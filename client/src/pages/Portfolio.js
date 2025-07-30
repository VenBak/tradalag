import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useState, useMemo, useCallback } from 'react';

import { GET_ME } from '../utils/queries';
import { ADD_STOCK, REMOVE_STOCK } from '../utils/mutation';
import useAuth from '../hooks/useAuth';

import Header from '../components/Header';
import PortfolioBarChart from '../components/PortfolioBarChart';
import TargetSectorForm from '../components/TargetSectorForm';
import TargetSectorBarChart from '../components/TargetSectorBarChart';
import PortfolioProgress from '../components/PortfolioProgress';

/* ───────────────── constants ───────────────── */
export const sectors = [
  'Basic Materials',
  'Consumer Discretionary',
  'Consumer Staples',
  'Energy',
  'Financials',
  'Healthcare',
  'Industrials',
  'Real Estate',
  'Technology',
  'Telecommunications',
  'Utilities',
];

/* ───────────────── helpers ───────────────── */
const groupBySector = (portfolio) => {
  const bucket = Object.fromEntries(sectors.map((s) => [s, []]));
  portfolio.forEach((p) => bucket[p.sector]?.push(p));
  return bucket;
};

const calcActualSectorPct = (portfolio) => {
  const totals = Array(sectors.length).fill(0);
  const grand = portfolio.reduce((sum, { sector, valueUSD }) => {
    const idx = sectors.indexOf(sector);
    if (idx > -1) totals[idx] += valueUSD;
    return sum + valueUSD;
  }, 0);
  return totals.map((v) => (grand ? +(v / grand * 100).toFixed(2) : 0));
};

/* ───────────────── component ───────────────── */
export default function Portfolio() {
  /* hooks (run on EVERY render, before any returns) */
  const loggedIn = useAuth();
  const { data, loading } = useQuery(GET_ME, { skip: !loggedIn });

  const [addStock]    = useMutation(ADD_STOCK,    { refetchQueries: [{ query: GET_ME }] });
  const [removeStock] = useMutation(REMOVE_STOCK, { refetchQueries: [{ query: GET_ME }] });
  const [draft, setDraft] = useState({});

  const portfolio = data?.me?.portfolio ?? [];
  const targetPct = data?.me?.targetSectorPercentages ?? Array(sectors.length).fill(0);

  const bySector  = useMemo(() => groupBySector(portfolio), [portfolio]);
  const actualPct = useMemo(() => calcActualSectorPct(portfolio), [portfolio]);

  const handleAdd = useCallback(
    async (sector) => {
      const d = draft[sector] || {};
      if (!d.ticker || !d.name || !d.shares || !d.valueUSD) return;
      await addStock({
        variables: {
          ...d,
          sector,
          shares: +d.shares,
          valueUSD: +d.valueUSD,
          recordedAt: d.recordedAt || new Date().toISOString(),
        },
      });
      setDraft((prev) => ({ ...prev, [sector]: {} }));
    },
    [addStock, draft],
  );

  const makeSubmit = (sector) => (e) => {
    e.preventDefault();
    handleAdd(sector);
  };

  if (!loggedIn) return <Container className="mt-4">Log in to view portfolio.</Container>;
  if (loading)    return null;

  return (
    <Container className="py-4">
      <Header />
      <h1 className="mb-4 text-center">My Portfolio</h1>

      <TargetSectorForm />

      <Row xs={1} md={2} lg={3} className="g-4 mt-4">
        {sectors.map((sector) => (
          <Col key={sector}>
            <Card>
              <Card.Header as="h5">{sector}</Card.Header>
              <Card.Body>
                {bySector[sector].length === 0 && <p>No holdings yet.</p>}
                {bySector[sector].map((stock) => (
                  <div
                    key={stock._id}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <strong>{stock.ticker}</strong>
                    <span>
                      {stock.shares} @ ${stock.valueUSD.toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => removeStock({ variables: { stockId: stock._id } })}
                    >
                      ✕
                    </Button>
                  </div>
                ))}

                <Form className="mt-3" onSubmit={makeSubmit(sector)}>
                {/* ── ticker & name ────────────────────── */}
                {['ticker', 'name'].map((field) => (
                  <Form.Control
                    key={field}
                    className="mb-2"
                    size="sm"
                    placeholder={field}
                    value={draft[sector]?.[field] ?? ''}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        [sector]: { ...p[sector], [field]: e.target.value },
                      }))
                    }
                  />
                ))}

                {/* ── shares & valueUSD (numeric) ──────── */}
                {['shares', 'valueUSD'].map((field) => (
                  <Form.Control
                    key={field}
                    className="mb-2"
                    size="sm"
                    type="number"
                    step="any"
                    placeholder={field}
                    value={draft[sector]?.[field] ?? ''}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        [sector]: { ...p[sector], [field]: e.target.value },
                      }))
                    }
                  />
                ))}

                {/* ── recordedAt date-time picker ───────── */}
                <InputGroup className="mb-2">
                  <InputGroup.Text>
                    {/* bootstrap-icons calendar (self-closing) */}
                    <i className="bi bi-calendar-event" />
                  </InputGroup.Text>
                  <Form.Control
                    type="datetime-local"
                    size="sm"
                    value={
                      draft[sector]?.recordedAt ??
                      new Date().toISOString().slice(0, 16) // default = now, trimmed to YYYY-MM-DDTHH:mm
                    }
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        [sector]: { ...p[sector], recordedAt: e.target.value },
                      }))
                    }
                  />
                </InputGroup>

                <Button size="sm" variant="primary" type="submit">
                  ＋ Add
                </Button>
              </Form>
              
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <PortfolioProgress/>
      <PortfolioBarChart className="mt-5" />

      <h2 className="mt-5 text-center">Actual vs Target Allocation</h2>
      <TargetSectorBarChart actual={actualPct} target={targetPct} />
    </Container>
  );
}
