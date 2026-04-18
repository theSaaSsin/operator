/* Pinokio installer for Operator · Scrapling sidecar
 * Install:  venv + pip install requirements
 * Start:    uvicorn on 127.0.0.1:5001
 * Operator polls http://127.0.0.1:5001/health
 */
module.exports = {
  version: "1.0",
  title: "Operator · Scrapling",
  description: "Stealth web scraper sidecar for TheSaaSsin Operator Lead Feed.",
  icon: "icon.png",

  menu: async (kernel, info) => {
    const running = info.running("start.js");
    if (running) {
      return [
        { icon: "fa-solid fa-square-xmark", text: "Stop", href: "stop.js" },
        { icon: "fa-solid fa-rotate", text: "Restart", href: "start.js" },
        { icon: "fa-solid fa-globe", text: "Open API docs", href: "http://127.0.0.1:5001/docs" },
      ];
    }
    const installed = info.exists("venv");
    return installed
      ? [{ icon: "fa-solid fa-play", text: "Start", href: "start.js" },
         { icon: "fa-solid fa-rotate", text: "Reinstall", href: "install.js" }]
      : [{ icon: "fa-solid fa-download", text: "Install", href: "install.js" }];
  },
};
