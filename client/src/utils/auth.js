const { default: decode } = require("jwt-decode");

// create a new class to instantiate for a user
class AuthService {
  // get user data from JSON web token by decoding it
  getProfile() {
    return decode(this.getToken());
  }

  notifyAuthChange() {
    window.dispatchEvent(new Event('authchange'));
  };

  // return `true` or `false` if token exists (does not verify if it's expired yet)
  loggedIn() {
    const token = this.getToken();
    return !!this.getToken();
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem('token');
  }

  login(idToken) {
    // Saves user token to localStorage and reloads the application for logged in status to take effect
    localStorage.setItem('token', idToken);
    this.notifyAuthChange();
  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('token');
    this.notifyAuthChange();
  }
}

export default new AuthService();