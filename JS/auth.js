// Minimal client-side auth helper using localStorage
const USER_KEY = 'site_user';

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

function isSignedIn() {
  return !!currentUser();
}

function signIn(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // trigger storage event for same-tab handlers
  window.dispatchEvent(new Event('storage'));
}

function signOut() {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('storage'));
}

function onAuthChange(cb) {
  // call immediately
  cb(currentUser());
  // listen to storage events
  window.addEventListener('storage', () => cb(currentUser()));
}

export { currentUser, isSignedIn, signIn, signOut, onAuthChange };
