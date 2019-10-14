import axios from 'axios';

import {showAlert} from './alert';

const stripe = Stripe('pk_test_whjXYEgaSP4IhqzultZc5fEO00SRdQCnKy');

export const bookTour = async tourId => {
  try {
    // 1) get checkout session
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log('session>>>',session);

    // 2) create checkout session from 
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
}