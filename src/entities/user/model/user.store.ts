import { createStore, createEvent } from 'effector';
import type { User } from './user.types'; // Assuming User type will be defined here

// Effects
// export const fetchUserProfileFx = createEffect(async (userId: string) => {
//   // API call to fetch user profile
//   // const data = await apiClient.get(`/users/${userId}`);
//   // return data;
// });

// Stores
export const $userProfile = createStore<User | null>(null);
export const $userLoading = createStore(false);
export const $userError = createStore<Error | null>(null);

// Events
export const clearUserProfile = createEvent();

// Logic
// $userProfile
//   .on(fetchUserProfileFx.doneData, (_, profile) => profile)
//   .reset(clearUserProfile);

// $userLoading
//   .on(fetchUserProfileFx.pending, (_, pending) => pending);

// $userError
//   .on(fetchUserProfileFx.failData, (_, error) => error)
//   .reset(fetchUserProfileFx, clearUserProfile);

// Initial data fetch example (if needed globally or on app start for current user)
// sample({
//   clock: appStarted, // Assuming an event like appStarted exists in app layer
//   target: fetchUserProfileFx, // Potentially with predefined/logged-in user ID
// }); 