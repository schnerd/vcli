import path from 'path';
import http from 'http';
import {ReadStream as FsReadStream} from 'fs';
import ReadStream = NodeJS.ReadStream;

import csvParse from 'csv-parse';
import express from 'express';
import opener from 'opener';
import ejs from 'ejs';
import {bold} from 'chalk';

const projectRoot = path.resolve(__dirname, '..');

interface ServerOptions {
  file?: string,
  reader: FsReadStream | ReadStream;
  port?: number;
  host?: string;
  logger: (msg: string) => any;
}

export async function startServer(opts: ServerOptions) {
  const {
    port = 8888,
    host = '127.0.0.1',
    file,
    reader,
    logger,
  } = opts;

  const app = express();

  app.engine('ejs', require('ejs').renderFile);
  app.set('view engine', 'ejs');
  app.set('views', `${projectRoot}/src/client/views`);
  app.use(express.static(`${projectRoot}/src/client/public`));

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
          });
      });
      res.json(data);
    } catch(err) {
      next(err);
    }
  });

  app.get('/', (req, res) => {
    res.render('index', {
      title: `vcli | ${file ? path.basename(file) : 'Visualizing Streamed Data'}`,
    });
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

