const jsonServer = require('json-server');
const auth = require('json-server-auth');
const server = jsonServer.create();
const router = jsonServer.router('./db.json');
const middlewares = jsonServer.defaults();
const cors = require('cors');

server.use(cors());
server.use(middlewares);

server.db = router.db;
server.use(auth);
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
