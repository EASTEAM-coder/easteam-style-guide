// EASTEAM Style Guide — Access Gate
// SHA-256 hash of the access code (plaintext never lives in source).
const EXPECTED_HASH = 'a0c5f8809f507a15e24de2d529ae5ccc6d808846590254f2141e3aa6d9826e71';
const STORAGE_KEY = 'easteam_sg_unlocked_v1';

// Pure-JS SHA-256 (Geraint Luff, public domain). Used as a fallback when the
// browser blocks crypto.subtle — e.g. on plain http:// (non-secure context).
function sha256JS(ascii) {
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii.length * 8;
  let hash = sha256JS.h = sha256JS.h || [];
  const k = sha256JS.k = sha256JS.k || [];
  let primeCounter = k.length;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) { isComposite[i] = candidate; }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return null; // expects byte string (0-255)
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) { hash[i] = (hash[i] + oldHash[i]) | 0; }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

async function sha256Hex(str) {
  // Prefer the native Web Crypto API (available on https:// and localhost).
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { /* fall through to the JS implementation */ }
  }
  // Fallback for non-secure contexts (plain http://). Encode to UTF-8 bytes first.
  return sha256JS(unescape(encodeURIComponent(str)));
}

function grantAccess() {
  document.body.classList.remove('locked');
  try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
}

try { if (sessionStorage.getItem(STORAGE_KEY) === '1') grantAccess(); } catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('gateForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('gatePass');
    const err = document.getElementById('gateError');
    err.textContent = '';
    const value = input.value.trim();
    if (!value) { err.textContent = 'Access code required'; return; }
    let hash = null;
    try {
      hash = await sha256Hex(value);
    } catch (e) {
      err.textContent = 'Could not verify code — please refresh and try again';
      return;
    }
    if (hash === EXPECTED_HASH) {
      grantAccess();
    } else {
      err.textContent = 'Incorrect access code';
      input.value = '';
      input.focus();
    }
  });
});
