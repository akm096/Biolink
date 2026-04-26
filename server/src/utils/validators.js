const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/i;

function validateUsername(username) {
  if (!username) return 'Username is required';
  if (!USERNAME_REGEX.test(username)) {
    return 'Username must be 3-30 characters: lowercase letters, numbers, underscores, dots only';
  }
  return null;
}

function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

function validateUrl(url) {
  if (!url) return null; // URLs are optional in many places
  if (!URL_REGEX.test(url)) return 'URL must start with http:// or https://';
  return null;
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
}

module.exports = {
  validateUsername,
  validateEmail,
  validatePassword,
  validateUrl,
  sanitizeString,
  USERNAME_REGEX,
  EMAIL_REGEX,
};
