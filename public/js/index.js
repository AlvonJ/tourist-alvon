import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, register } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const registerForm = document.querySelector('.form--register');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// DELEGATION
if (mapBox) {
   const locations = JSON.parse(mapBox.dataset.locations);
   displayMap(locations);
}

if (loginForm) {
   loginForm.addEventListener('submit', ev => {
      ev.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
   });
}

if (registerForm) {
   registerForm.addEventListener('submit', ev => {
      ev.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmationPassword = document.getElementById(
         'confirmationPassword'
      ).value;
      register(name, email, password, confirmationPassword);
   });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
   userDataForm.addEventListener('submit', ev => {
      ev.preventDefault();

      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);

      console.log(form);

      updateSettings(form, 'data');
   });

if (userPasswordForm)
   userPasswordForm.addEventListener('submit', async ev => {
      ev.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...';
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await updateSettings(
         { passwordCurrent, password, passwordConfirm },
         'password'
      );

      document.querySelector('.btn--save-password').textContent =
         'Save Password';

      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
   });

if (bookBtn)
   bookBtn.addEventListener('click', ev => {
      ev.target.textContent = 'Processing...';
      const { tourId } = ev.target.dataset;
      bookTour(tourId);
   });