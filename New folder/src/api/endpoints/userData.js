import { apiRequest } from '../client';

export function getUserData() {
  return apiRequest('/user/data');
}

export function updateUserData(payload) {
  return apiRequest('/user/data', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteUserData() {
  return apiRequest('/user/data', {
    method: 'DELETE',
  });
}
