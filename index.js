const server = require('./server');

const port = process.envPORT || 5000;

server.listen(port, () => console.log('server on port 5k'));