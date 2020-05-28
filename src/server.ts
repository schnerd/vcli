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
  chartConfig?: any;
  file?: string;
  reader: FsReadStream | ReadStream;
  port?: number;
  host?: string;
  logger: (msg: string) => any;
  dev: boolean;
}

export async function startServer(opts: ServerOptions) {
  const {port = 8888, host = '127.0.0.1', reader, logger, dev} = opts;

  const app = express();

  const nextApp = nextJs({dev, dir: './src/client'});
  await nextApp.prepare();
  const nextHandler = nextApp.getRequestHandler();

  // Cache the data in case the user hits the page multiple times
  let dataResponse: any;
  app.get('/data', async (req, res, next) => {
    // If we've already cached the data, just return that
    if (dataResponse) {
      res.json(dataResponse);
      return;
    }
    try {
      const data: any[] = [];
      await new Promise((resolve, reject) => {
        reader
          .pipe(
            csvParse({
              cast: true,
              cast_date: false,
            }),
          )
          .on('error', (error) => {
            reject(error);
          })
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', () => {
            resolve();
          });
      });
      dataResponse = {};
      dataResponse.chartConfig = opts.chartConfig || null;
      dataResponse.file = opts.file || null;
      dataResponse.data = data;
      res.json(dataResponse);
    } catch (error) {
      next(error);
    }
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
