const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();
const socketPath = '/var/run/webapps/lagden-dev.sock';

app.prepare().then(() => {
  // Remove socket file if it exists
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(socketPath, () => {
    console.log(`> Ready on unix socket ${socketPath}`);
    // Set permissions so nginx can access it
    fs.chmodSync(socketPath, 0o666);
  });
});
