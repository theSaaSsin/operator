/* TheSaaSsin Operator — runtime config
 * Centralises the API origin so Tauri / desktop / remote deploys
 * never need to touch operator.js.
 */
window.OP_CONFIG = {
  version: '0.2.0',
  phase:   0,
  // API base — resolves correctly for localhost, Railway, Tauri sidecar, etc.
  API: (function () {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') {
      return 'http://localhost:' + (window.location.port || 4000) + '/api';
    }
    return window.location.origin + '/api';
  }())
};
