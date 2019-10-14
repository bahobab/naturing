/* eslint-disable */

import axios from 'axios';

import {showAlert} from './alert';

export const login = async (email, password) => {
  console.log('>>login in..', email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login', // we don't specify host because same host
      // withCredentials: 'same-origin',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Login success')
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      alert('login failed!!');
    }
  } catch (err) {
    showAlert('error', 'Login failed! Please use proper credentials')
    console.log(err.response.data);
  }
};

export const logout = async () => {
  try {
    const response = await axios({
      url: '/api/v1/users/logout',
      method: 'GET',
    });

    if (response.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'Error logging out! Please try again...')
  }
}


  // try {
  //   const res = await fetch('http://127.0.0.1:3003/api/v1/users/login', {
  //     method: 'POST',
  //     redirect: 'follow',
  //     mode: 'same-origin',
  //     credentials: 'include',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email, password })
  //   });
  //   const json = await res.json();
  //   console.log(json);
  // } catch (err) {
  //   console.log('Login ERROR', err);
  // }

  // checkout these tuts on jwt
// https://scotch.io/tutorials/authenticate-a-node-es6-api-with-json-web-tokens
// https://tutorialedge.net/nodejs/nodejs-jwt-authentication-tutorial/
// https://jasonwatmore.com/post/2018/06/14/nodejs-mongodb-simple-api-for-authentication-registration-and-user-management
// https://www.codementor.io/olatundegaruba/5-steps-to-authenticating-node-js-with-jwt-7ahb5dmyr
// https://codingshiksha.com/javascript/node-js-api-authentication-with-jwt/

// https://stackoverflow.com/questions/3342140/cross-domain-cookies