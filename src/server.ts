import http from 'http';
import getPort from 'get-port';
import {parse} from 'url';

import nextJs from 'next';
import express from 'express';
import opener from 'opener';
import {bold} from 'chalk';
import {DataResponse} from './types';

interface ServerOptions {
  data: Promise<DataResponse>;
  port?: number;
  host?: string;
  logger: (msg: string) => any;
  dev: boolean;
}

export async function startServer(opts: ServerOptions) {
  const {port, host = '127.0.0.1', data, logger, dev} = opts;

  const app = express();

  const isPackaged = __dirname.endsWith('/lib');
  const nextApp = nextJs({dev, dir: isPackaged ? __dirname : './src/client'});
  await nextApp.prepare();
  const nextHandler = nextApp.getRequestHandler();

  app.get('/data', async (req, res, next) => {
    data.then((payload) => res.json(payload)).catch((error) => next(error));
  });

  // Let next handle the other endpoints
  app.use((req, res) => {
    const parsedUrl = parse(req.url, true);
    nextHandler(req, res, parsedUrl);
  });

  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    function onServerStart() {
      resolve();

      const url = `http://${host}:${(server.address() as any).port}`;

      logger(
        `${bold('vcli')} | Visualizing your data at ${bold(url)}\n` +
          `Use ${bold('Ctrl+C')} to close it`,
      );

      opener(url);
    }

    if (port) {
      server.listen(port, host, onServerStart);
      return;
    }

    getPort({host: '127.0.0.1', port: getPort.makeRange(8888, 9999)})
      .then((openPort) => {
        console.log('Open port', openPort);
        server.listen(openPort, host, onServerStart);
      })
      .catch(reject);
  });

  return {
    app,
    server,
  };
}
