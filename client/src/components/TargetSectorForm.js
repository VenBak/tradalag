import { useState, useMemo } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Form, Button, Table, Row, Col, InputGroup, FormControl, Alert, ProgressBar } from 'react-bootstrap';
import sectors from '../data/sectors';
import {SET_TARGETS} from '../utils/mutation'

export default function TargetSectorForm() {
  const [totalUSD, setTotalUSD] = useState('');
  const [perc, setPerc] = useState(Array(sectors.length).fill(''));
  const [setTargets, { loading, error }] = useMutation(SET_TARGETS);

  /* --- derived helpers --- */
  const numericPerc = perc.map(Number);
  const sum = useMemo(() => numericPerc.reduce((t, n) => t + (isNaN(n) ? 0 : n), 0), [numericPerc]);
  const isValid = Math.abs(sum - 100) < 0.01 && totalUSD;

  /* --- handlers --- */
  const handleChange = (i, v) => {
    const next = [...perc];
    next[i] = v;
    setPerc(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setTargets({
      variables: {
        total: parseFloat(totalUSD),
        percentages: numericPerc.map((n) => +n.toFixed(2)),
      },
    });
  };

  /* --- UI --- */
  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      {/* total amount + submit button in two columns */}
      <Row className="align-items-end g-3 mb-3">
        <Col xs={12} md={6} lg={4}>
          <Form.Group controlId="totalUsd">
            <Form.Label>Total Amount (USD)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="any"
              value={totalUSD}
              onChange={(e) => setTotalUSD(e.target.value)}
              required
            />
          </Form.Group>
        </Col>
        <Col xs="auto">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !isValid}
            className="w-100"
          >
            {loading ? 'Saving…' : 'Save targets'}
          </Button>
        </Col>
      </Row>

      {/* two-column table of sectors + % inputs */}
      <Table striped bordered hover size="sm" responsive>
        <thead>
          <tr>
            <th style={{ width: '60%' }}>Sector</th>
            <th className="text-end" style={{ width: '40%' }}>
              Target&nbsp;%
            </th>
          </tr>
        </thead>
        <tbody>
          {sectors.map((sec, i) => (
            <tr key={sec}>
              <td>{sec}</td>
              <td>
                <InputGroup>
                  <FormControl
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={perc[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    required
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* live % total feedback */}
      <ProgressBar
        now={Math.min(sum, 100)}
        label={`${sum.toFixed(2)} %`}
        variant={isValid ? 'success' : 'warning'}
        className="mb-2"
      />
      {!isValid && (
        <Alert variant="warning">
          Percentages must sum to exactly&nbsp;100&nbsp;% (currently {sum.toFixed(2)} %).
        </Alert>
      )}
      {error && <Alert variant="danger">{error.message}</Alert>}
    </Form>
  );
}
