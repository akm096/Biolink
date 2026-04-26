/**
 * IP Geolocation utility using ip-api.com (free, no API key needed)
 * - In-memory cache with 1 hour TTL per IP
 * - Rate limit: 45 requests/minute (free tier)
 */

const http = require('http');

// In-memory cache: ip -> { country, city, fetchedAt }
const geoCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function lookupIp(ip) {
  return new Promise((resolve) => {
    // Skip local/private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::ffff:127.0.0.1') {
      return resolve({ country: 'Local', city: 'localhost' });
    }

    // Strip IPv6 prefix
    const cleanIp = ip.replace(/^::ffff:/, '');

    // Check cache
    const cached = geoCache.get(cleanIp);
    if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL) {
      return resolve({ country: cached.country, city: cached.city });
    }

    const url = `http://ip-api.com/json/${cleanIp}?fields=status,country,city`;

    const req = http.get(url, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success') {
            const result = { country: json.country || '', city: json.city || '' };
            geoCache.set(cleanIp, { ...result, fetchedAt: Date.now() });
            resolve(result);
          } else {
            resolve({ country: '', city: '' });
          }
        } catch {
          resolve({ country: '', city: '' });
        }
      });
    });

    req.on('error', () => {
      resolve({ country: '', city: '' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ country: '', city: '' });
    });
  });
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '';
}

module.exports = { lookupIp, getClientIp };
