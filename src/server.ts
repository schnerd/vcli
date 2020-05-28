import path from 'path';
import http from 'http';
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
  const {port = 8888, host = '127.0.0.1', data, logger, dev} = opts;

  const app = express();

  const nextApp = nextJs({dev, dir: './src/client'});
  await nextApp.prepare();
  const nextHandler = nextApp.getRequestHandler();

  app.get('/data', async (req, res, next) => {
    data.then((payload) => res.json(payload)).catch((error) => next(error));
  });

  // Set up next static directories first
  const nextStaticDir = path.join(path.resolve(__dirname, './client/.next'), 'public');
  app.use('/_next/static', express.static(nextStaticDir));

  // Let next handle the other endpoints
  app.use((req, res) => {
    const parsedUrl = parse(req.url, true);
    nextHandler(req, res, parsedUrl);
  });

  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(port, host, () => {
      resolve();

      const url = `http://${host}:${(server.address() as any).port}`;

      logger(
        `${bold('vcli')} | Visualizing your data at ${bold(url)}\n` +
          `Use ${bold('Ctrl+C')} to close it`,
      );

      opener(url);
    });
  });

  return {
    app,
    server,
  };
}
