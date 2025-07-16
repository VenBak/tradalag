import { useQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
import { GET_ME } from '../utils/queries';
import auth from '../utils/auth';
import { SET_API_KEY, CLEAR_API_KEY } from '../utils/mutation';

export default function ApiKeyBox() {
  const [keyInput, setKeyInput] = useState('');

  /* 1 │ mutations stay the same */
  const [setApiKey]   = useMutation(SET_API_KEY,   { refetchQueries: [{ query: GET_ME }] });
  const [clearApiKey] = useMutation(CLEAR_API_KEY, { refetchQueries: [{ query: GET_ME }] });

  /* 2 │ only run the query when a token is present */
  const loggedIn = auth.loggedIn();
  const { data, loading, refetch } = useQuery(GET_ME, {
    skip: !loggedIn,                         // query runs only when logged-in
    fetchPolicy: 'network-only',             // always hit the server
  });

  useEffect(() => {
    if (loggedIn) refetch();
  }, [loggedIn, refetch]);  

  if (!loggedIn)           return null;
  if (loading || !data) return null;           // still fetching -or- not signed in

  /* 3 │ pull the key out of the result ----------- */
  const apiKey = data?.me?.apiKey ?? null;

  return (
    <div className="mt-4 space-y-2">

      {/* 4 │ show the INPUT when the user **has no** key yet */}
      {!apiKey && (
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            const trimmed = keyInput.trim();
            if (trimmed) {
              setApiKey({ variables: { apiKey: trimmed } })
                .then(() => setKeyInput(''));
            }
          }}
        >
          <input
            className="flex-1 rounded border px-2 py-1"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder="Paste your API key"
          />
          <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
            Save
          </button>
        </form>
      )}

      {/* 5 │ show the STORED key + delete button when the user **has** a key */}
      {apiKey && (
        <div className="flex items-center gap-4 rounded border p-2">
          <code className="flex-1 truncate">{apiKey}</code>
          <button
            className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
            onClick={() => clearApiKey()}
            title="Delete stored key"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
