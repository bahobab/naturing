// checkout these tuts on jwt
// https://scotch.io/tutorials/authenticate-a-node-es6-api-with-json-web-tokens
// https://tutorialedge.net/nodejs/nodejs-jwt-authentication-tutorial/
// https://jasonwatmore.com/post/2018/06/14/nodejs-mongodb-simple-api-for-authentication-registration-and-user-management
// https://www.codementor.io/olatundegaruba/5-steps-to-authenticating-node-js-with-jwt-7ahb5dmyr
// https://codingshiksha.com/javascript/node-js-api-authentication-with-jwt/

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3003/api/v1/users/login',
      withCredentials: 'same-origin',
      data: {
        email,
        password
      }
    });
    console.log(res);
  } catch (err) {
    console.log(err.response.data);
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
};

document.querySelector('.form').addEventListener('submit', event => {
  event.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  login(email, password);
});
