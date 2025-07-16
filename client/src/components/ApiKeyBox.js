import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { GET_ME } from '../utils/queries';
import { SET_API_KEY, CLEAR_API_KEY } from '../utils/mutation';

export default function ApiKeyBox() {
  const { data, loading } = useQuery(GET_ME);
  const [keyInput, setKeyInput] = useState('');
  const [setApiKey] = useMutation(SET_API_KEY, {
    refetchQueries: [GET_ME],   // keep cache 100 % accurate
  });
  const [clearApiKey] = useMutation(CLEAR_API_KEY, {
    refetchQueries: [GET_ME],
  });

  if (loading || !data?.me) return null;         // still fetching or not logged-in

  const { apiKey } = data.me;

  return (
    <div className="mt-4 space-y-2">
      {/* input appears only if no key yet */}
      {!apiKey && (
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            if (keyInput.trim()) setApiKey({ variables: { apiKey: keyInput.trim() } })
              .then(() => setKeyInput(''));
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

      {/* existing key display */}
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
