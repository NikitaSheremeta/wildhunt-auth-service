const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error-middleware');

dotenv.config();

const TEN_SECONDS_IN_MILLISECONDS = 10000;

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api/v1', routes);
app.use(errorMiddleware);

let server;

const start = async function startServer() {
  server = app.listen(process.env.SERVER_PORT, () =>
    console.log(
      `Server started on port: ${process.env.SERVER_PORT}, Pid: ${process.pid}`
    )
  );
};

const shutdown = (reason) => {
  console.log(`Shutting down (${reason})...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    setTimeout(() => {
      console.warn('Forcing shutdown after 10s timeout.');
      process.exit(1);
    }, TEN_SECONDS_IN_MILLISECONDS).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  shutdown('unhandledRejection');
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  shutdown('uncaughtException');
});

start();
