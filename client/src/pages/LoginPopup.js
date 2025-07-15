import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ADD_PROFILE, LOGIN } from '../utils/mutation';
import Auth from '../utils/auth';

const LoginPopup = () => {
  const [show, setShow] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [addProfile, { loading: signUpLoading }] = useMutation(ADD_PROFILE, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.addProfile.token);
      setShow(false);
      setUsername('');
      setPassword('');
      setError('');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const [login, { loading: loginLoading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.login.token);
      setShow(false);
      setUsername('');
      setPassword('');
      setError('');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setShow(false);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
    const variables = { username, password };

    // Choose the right mutation
    if (isSignUp) {
      await addProfile({ variables });   // onCompleted handles token + cleanup
    } else {
      await login({ variables });        // onCompleted handles token + cleanup
    }

  } catch (e) {
    console.error(e);           // GraphQL/Network errors land here
  }
  };

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => setShow(true)}
      >
        {isAuthenticated ? 'Sign Out' : 'Sign In / Sign Up'}
      </button>

      {show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isAuthenticated ? 'Sign Out' : isSignUp ? 'Sign Up' : 'Sign In'}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShow(false)}
                ></button>
              </div>
              <div className="modal-body">
                {isAuthenticated ? (
                  <div>
                    <p>Are you sure you want to sign out?</p>
                    <button className="btn btn-danger" onClick={handleSignOut}>
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={signUpLoading || loginLoading}
                    >
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPopup;