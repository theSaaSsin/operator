module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "venv",
        message: "uvicorn app:app --host 127.0.0.1 --port 5001 --reload",
        on: [{ event: "/Uvicorn running on/", done: true }],
      },
    },
  ],
};
