/* eslint-disable */

import '@babel/polyfill';

import {displayMap} from './mapBox';
import { login, logout } from './login';
import { updateUserSettings } from './updateSettings';
import {bookTour} from './stripe';

import { file } from 'babel-types';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logoutButton = document.querySelector('.logout');
const updateDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookTourButton = document.querySelector('#book-tour');
// DELEGATION
if (mapBox) {
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log('### displayMap', displayMap);
  
  displayMap(locations);
}

// LOGIN USER
if (loginForm) {
  
  loginForm.addEventListener('submit', event => {
    // console.log('### Login Form', email.value, password.value);
    // VALUES

    event.preventDefault();
    
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    login(email.value, password.value);
  })
}

// LOGOUT USER
if (logoutButton) logoutButton.addEventListener('click', logout);

// UPDATE USER DATA
if (updateDataForm) {
  updateDataForm.addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData();
  form.append('name', document.querySelector('#name').value);
  form.append('email', document.querySelector('#email').value );
  form.append('photo', document.querySelector('#photo').files[0]);

  await updateUserSettings(form, 'user data');

})};

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async event => {
    event.preventDefault();
    document.querySelector('#btn--save-password').textContent = 'Updating password...';
    
    const passwordCurrent = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    await updateUserSettings({passwordCurrent, password, passwordConfirm}, 'password');

    // clear fields
    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';

    document.querySelector('#btn--save-password').textContent = 'Save Password!!';

  });
};

if (bookTourButton) {
  bookTourButton.addEventListener('click', async event => {
    bookTourButton.textContent = 'Processing...';
    const {tourId} = bookTourButton.dataset;
    await bookTour(tourId);
    
    bookTourButton.textContent = 'Book Tour';
  });
}