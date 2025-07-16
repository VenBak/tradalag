import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Form, Row, Col } from 'react-bootstrap';
import { GET_ME } from '../utils/queries';
import { ADD_STOCK, REMOVE_STOCK } from '../utils/mutation';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';
import Header from '../components/Header';

const sectors = [
  'Basic Materials','Consumer Discretionary','Consumer Staples','Energy','Financials',
  'Healthcare','Industrials','Real Estate','Technology','Telecommunications','Utilities'
];

export default function Portfolio() {
  const loggedIn = useAuth();
  const { data, loading } = useQuery(GET_ME, { skip: !loggedIn });
  const [addStock]    = useMutation(ADD_STOCK,    { refetchQueries: [{ query: GET_ME }] });
  const [removeStock] = useMutation(REMOVE_STOCK, { refetchQueries: [{ query: GET_ME }] });

  const [draft, setDraft] = useState({});   // holds form state per sector

  if (!loggedIn) return <Container className="mt-4">Log in to view portfolio.</Container>;
  if (loading || !data) return null;

  const bySector = Object.fromEntries(sectors.map(s => [s, []]));
  data.me.portfolio.forEach(p => bySector[p.sector]?.push(p));

  const handleAdd = async (sector) => {
    const d = draft[sector] || {};
    if (!d.ticker || !d.name || !d.shares || !d.valueUSD) return;
    await addStock({ variables: { ...d, sector, shares: +d.shares, valueUSD: +d.valueUSD } });
    setDraft(prev => ({ ...prev, [sector]: {} }));
  };

  return (
    <Container className="py-4">
    <Header/>
      <h1 className="mb-4 text-center">My Portfolio</h1>
      <Row xs={1} md={2} lg={3} className="g-4">
        {sectors.map(sector => (
          <Col key={sector}>
            <Card>
              <Card.Header as="h5">{sector}</Card.Header>
              <Card.Body>
                {bySector[sector].length === 0 && <p>No holdings yet.</p>}
                {bySector[sector].map(stock => (
                  <div key={stock._id} className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{stock.ticker}</strong>
                    <span>{stock.shares} @ ${stock.valueUSD.toFixed(2)}</span>
                    <Button
                      size="sm" variant="outline-danger"
                      onClick={() => removeStock({ variables: { stockId: stock._id } })}
                    >
                      ✕
                    </Button>
                  </div>
                ))}

                {/* mini-form */}
                <Form className="mt-3"
                  onSubmit={e => { e.preventDefault(); handleAdd(sector); }}>
                  {['ticker','name','shares','valueUSD'].map(field => (
                    <Form.Control
                      key={field}
                      className="mb-2"
                      size="sm"
                      type={field === 'shares' || field === 'valueUSD' ? 'number' : 'text'}
                      step="any"
                      placeholder={field}
                      value={(draft[sector]?.[field] ?? '')}
                      onChange={e => setDraft(p => ({
                        ...p,
                        [sector]: { ...p[sector], [field]: e.target.value },
                      }))}
                    />
                  ))}
                  <Button size="sm" variant="primary" type="submit">＋ Add</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
