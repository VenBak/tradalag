// src/components/PortfolioTotalCard.jsx
import { gql, useQuery } from '@apollo/client';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { formatCurrency } from '../utils/format';
import { GET_PORTFOLIO_TOTAL } from '../utils/queries';

export default function PortfolioProgress() {
  const { data, loading, error } = useQuery(GET_PORTFOLIO_TOTAL, {
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return (
      <Card className="text-center">
        <Card.Body>
          <Spinner animation="border" role="status" size="sm" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error.message}
      </Alert>
    );
  }

  return (
    <Card className="text-center shadow-sm">
      <Card.Header as="h5">Total Portfolio Value</Card.Header>
      <Card.Body>
        <Card.Text className="display-6 m-0">
          {formatCurrency(data.portfolioTotalValue)}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
