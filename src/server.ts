import path from 'path';
import http from 'http';
import {parse} from 'url';
import {ReadStream as FsReadStream} from 'fs';
import ReadStream = NodeJS.ReadStream;

import nextJs from 'next';
import csvParse from 'csv-parse';
import express from 'express';
import opener from 'opener';
import {bold} from 'chalk';

interface ServerOptions {
  file?: string,
  reader: FsReadStream | ReadStream;
  port?: number;
  host?: string;
  logger: (msg: string) => any;
  dev: boolean;
}

export async function startServer(opts: ServerOptions) {
  const {
    port = 8888,
    host = '127.0.0.1',
    reader,
    logger,
    dev,
  } = opts;

  const app = express();

  const nextApp = nextJs({dev, dir: './src/client'});
  await nextApp.prepare();
  const nextHandler = nextApp.getRequestHandler();

  // TODO This endpoint could be hit multiple times if the user refreshes the page, need to cache the data
  let data: Array<any>;
  app.get('/data', async (req, res, next) => {
    // If we've already cached the data, just return that
    if (data) {
      res.json(data);
      return;
    }
    try {
      await new Promise((resolve, reject) => {
        data = [];
        reader.pipe(csvParse({
          cast: true,
          cast_date: false,
        }))
          .on('error', (err) => {
            reject(err);
          })
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', () => {
            resolve();
          })
      });
      res.json(data);
    } catch(err) {
      next(err);
    }
  });

  // Set up next static directories first
  const nextStaticDir = path.join(path.resolve(__dirname, './client/.next'), 'public');
  app.use('/_next/static', express.static(nextStaticDir));

  // Let next handle the other endpoints
  app.use((req, res) => {
    const parsedUrl = parse(req.url, true)
    nextHandler(req, res, parsedUrl)
  });

  const server = http.createServer(app);

  await new Promise(resolve => {
    server.listen(port, host, () => {
      resolve();

      const url = `http://${host}:${(server.address() as any).port}`;

      logger(
        `${bold('vcli')} | Visualizing your data at ${bold(url)}\n` +
        `Use ${bold('Ctrl+C')} to close it`
      );

      opener(url);
    });
  });

  return {
    app,
    server
  };
}

