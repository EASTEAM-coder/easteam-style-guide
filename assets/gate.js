// EASTEAM Style Guide — Access Gate
// SHA-256 hash of the access code (plaintext never lives in source).
const EXPECTED_HASH = 'a0c5f8809f507a15e24de2d529ae5ccc6d808846590254f2141e3aa6d9826e71';
const STORAGE_KEY = 'easteam_sg_unlocked_v1';

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
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
    const hash = await sha256Hex(value);
    if (hash === EXPECTED_HASH) {
      grantAccess();
    } else {
      err.textContent = 'Incorrect access code';
      input.value = '';
      input.focus();
    }
  });
});
