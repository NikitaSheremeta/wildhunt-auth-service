require('newrelic');

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

const app = express();

const ONE_CPU = 1;

const serverPort = process.env.SERVER_PORT;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api/v1', routes);
app.use('/static', express.static(__dirname + '/templates/assets/img'));
app.use(errorMiddleware);

const start = async function startServer() {
  if (cluster.isMaster) {
    const cpusCount = os.cpus().length;

    for (let i = 0; i < cpusCount - ONE_CPU; i++) {
      const worker = cluster.fork();

      worker.on('exit', () => {
        console.log(`Worker died! Pid: ${worker.process.pid}`);

        cluster.fork();
      });
    }
  } else {
    app.listen(serverPort, () =>
      console.log(`Server started on port: ${serverPort}, Pid: ${process.pid}`)
    );
  }
};

start();
