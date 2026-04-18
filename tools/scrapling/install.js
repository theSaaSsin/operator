module.exports = {
  run: [
    { method: "shell.run", params: { message: "python -m venv venv" } },
    {
      method: "shell.run",
      params: {
        venv: "venv",
        message: [
          "pip install --upgrade pip",
          "pip install -r requirements.txt",
          "scrapling install || echo 'scrapling install step optional'",
        ],
      },
    },
  ],
};
