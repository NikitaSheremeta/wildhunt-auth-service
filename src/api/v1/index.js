const dotenv = require('dotenv');
const express = require('express');
const cluster = require('cluster');
const os = require('os');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error-middleware');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;
const ONE_CPU = 1;
const SERVER_PORT = process.env.SERVER_PORT;

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api/v1', routes);
app.use(errorMiddleware);

const start = async function startServer() {
  if (NODE_ENV === 'production' && (cluster.isPrimary || cluster.isMaster)) {
    const cpusCount = os.cpus().length;

    for (let i = 0; i < cpusCount - ONE_CPU; i++) {
      const worker = cluster.fork();

      worker.on('exit', () => {
        console.log(`Worker died! Pid: ${worker.process.pid}`);

        cluster.fork();
      });
    }
  } else {
    app.listen(SERVER_PORT, () =>
      console.log(`Server started on port: ${SERVER_PORT}, Pid: ${process.pid}`)
    );
  }
};

start();
