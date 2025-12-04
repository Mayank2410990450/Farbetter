import apiClient from './apiClient';

export async function fetchOffers() {
  const { data } = await apiClient.get('/offers');
  return data;
}

export async function fetchAllOffers() {
  const { data } = await apiClient.get('/offers/admin/all');
  return data;
}

export async function fetchOfferById(id) {
  const { data } = await apiClient.get(`/offers/${id}`);
  return data;
}

export async function createOffer(offerData) {
  const { data } = await apiClient.post('/offers', offerData);
  return data;
}

export async function updateOffer(id, offerData) {
  const { data } = await apiClient.put(`/offers/${id}`, offerData);
  return data;
}

export async function deleteOffer(id) {
  const { data } = await apiClient.delete(`/offers/${id}`);
  return data;
}
