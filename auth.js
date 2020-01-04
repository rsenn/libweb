import { Component } from 'react';
import Router from 'next/router';
//import cookie, { Cookie } from 'js-cookie';
import { axios } from 'axios';
import { getStore } from '../stores/createStore.js';

const cookieKey = 'email';

export const destroyUserCookie = () => Cookie.remove(cookieKey);

export const cookieMap = cookie => {
  if(typeof cookie !== 'string') return {};
  const parts = cookie.split(/;\s*/g);
  if(!parts) return {};
  return parts.reduce((acc, p) => {
    const matches = /^([^=]*)=(.*)$/.exec(p);
    if(matches) acc[matches[1]] = matches[2];
    return acc;
  }, {});
};

export const getUserFromCookie = req => {
  const { cookie } = req.headers;
  if(!cookie) return null;
  const userCookie = cookie.split(';').find(c => c.trim().startsWith(`${cookieKey}=`));
  if(!userCookie) return null;
  const user = decodeURIComponent(userCookie.split(`${cookieKey}=`)[1]);
  return JSON.parse(user);
};

export const setUserCookie = user => Cookie.set(cookieKey, JSON.stringify(user));

//Gets the display name of a JSX component for dev tools
const getDisplayName = Component => Component.displayName || Component.name || 'Component';
/*
export const auth = ctx => {
  const { token, user } = ctx;
  console.log('auth', { token, user });

  ['UserStore', 'RootStore'].forEach(store => {
    const s = getStore(store);
    if(s && store == 'UserStore') {
      s.setAuthUser({ token, username: user });
      console.log(`${store}.setState{ token: ${token} }`);
    }
  });

  if(ctx.req && !token) {
    ctx.res.writeHead(302, { Location: '/login' });
    ctx.res.end();
    return;
  }

  //We already checked for server. This should only happen on client.
  if(!token) {
    Router.push('/login');
  }

  return token && token !== 'undefined' ? token : undefined;
};*/
/*
//utils/AuthService.js
export class AuthService {
  constructor(domain) {
    this.domain = domain || Util.makeURL({ location: '' });
    this.fetch = this.fetch.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  login(email, password) {
    //Get a token
    return axios
      .post(
        `${this.domain}/token`,
        JSON.stringify({
          email,
          password,
          profile: true
        })
      )
      .then(res => {
        this.setToken(res.data.key);
      })
      .then(res => {
        this.setProfile(res);
        return Promise.resolve(res);
      });
  }

  loggedIn() {
    //Checks if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !isTokenExpired(token); // handwaiving here
  }

  setProfile(profile) {
    //Saves profile data to localStorage
    localStorage.setItem('profile', JSON.stringify(profile));
  }

  getProfile() {
    //Retrieves the profile data from localStorage
    const profile = localStorage.getItem('profile');
    return profile ? JSON.parse(localStorage.profile) : {};
  }

  setToken(idToken) {
    //Saves user token to localStorage
    localStorage.setItem('token', idToken);
  }

  getToken() {
    //Retrieves the user token from localStorage
    return localStorage.getItem('token');
  }

  logout() {
    //Clear user token and profile data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
  }

  _checkStatus(response) {
    //raises an error in case response status is not a success
    if(response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  fetch(url, options) {
    //performs api calls sending the required authentication headers
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    if(this.loggedIn()) {
      headers['Authorization'] = 'Bearer ' + this.getToken();
    }
    return axios
      .get(url, {
        headers,
        ...options
      })
      .then(this._checkStatus)
      .then(response => response.json());
  }
}
*/
//utils/withAuth.js - a HOC for protected pages
export function withAuth(AuthComponent) {
  const Auth = new AuthService('http://localhost:5000');
  return class Authenticated extends Component {
    constructor(props) {
      super(props);
      this.state = {
        isLoading: true
      };
    }

    componentDidMount() {
      if(!Auth.loggedIn()) {
        this.props.url.replaceTo('/');
      }
      this.setState({ isLoading: false });
    }

    render() {
      return <div>{this.state.isLoading ? <div>LOADING....</div> : <AuthComponent {...this.props} auth={Auth} />}</div>;
    }
  };
}
