import { useQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';
import { GET_ME } from '../utils/queries';
import { SET_API_KEY, CLEAR_API_KEY } from '../utils/mutation';

export default function ApiKeyBox() {
  const loggedIn = useAuth();                 // live auth state
  const [keyInput, setKeyInput] = useState('');

  const { data, loading, refetch } = useQuery(GET_ME, {
    skip: !loggedIn,
    fetchPolicy: 'network-only',
  });

  const [setApiKey, { error: setErr }]   = useMutation(SET_API_KEY,   {
    refetchQueries: [{ query: GET_ME }],
  });
  const [clearApiKey, { error: clrErr }] = useMutation(CLEAR_API_KEY, {
    refetchQueries: [{ query: GET_ME }],
  });

  /* fire once right after a successful login */
  useEffect(() => { if (loggedIn) refetch(); }, [loggedIn, refetch]);

  if (!loggedIn || loading || !data) return null;

  const apiKey = data.me?.apiKey ?? null;

  return (
    <Card className="mb-4">
      <Card.Header as="h5">You can save your API key here</Card.Header>
      <Card.Body>

        {!apiKey && (
          <Form
            onSubmit={e => {
              e.preventDefault();
              const trimmed = keyInput.trim();
              if (trimmed)
                setApiKey({ variables: { apiKey: trimmed } })
                  .then(() => setKeyInput(''));
            }}
            className="d-flex gap-2"
          >
            <Form.Control
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Paste your API key"
            />
            <Button variant="primary" type="submit">Save</Button>
          </Form>
        )}

        {apiKey && (
          <div className="d-flex align-items-center gap-3">
            <code className="flex-grow-1 text-wrap">{apiKey}</code>
            <Button variant="outline-danger" onClick={() => clearApiKey()}>Delete</Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
