import axios from 'axios';

import {showAlert} from './alert';

export const updateUserSettings = async (data, type) => {
  try {
    const url = type === 'password'
      ? '/api/v1/users/changeMyPassword'
      : '/api/v1/users/updateMe';
    
      const res = await axios({
      url ,
      method: 'PATCH',
      data
    });

    if (res.data.status === 'success') showAlert('success', `${type.toUpperCase()} updates were successful`);
  } catch (err) {
    showAlert('error', err.res.data)
  }
}
