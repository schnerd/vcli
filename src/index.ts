import {Command, flags} from '@oclif/command';
// import csvParse from 'csv-parse';
import fs, {ReadStream as FsReadStream} from 'fs';
import path from 'path';
import {startServer} from './server';
import ReadStream = NodeJS.ReadStream;

interface ArgsType {
  file?: string | null;
}
interface FlagsType {}
interface ParseType {
  args: ArgsType;
  flags: FlagsType;
}
type Row = Array<any>;

class Vcli extends Command {
  static description = 'describe the command here';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    dev: flags.boolean({hidden: true}),
  };

  static args = [
    {
      name: 'file',
      required: false,
      description: 'Explicit path to CSV file (instead of piping data into vcli)',
    },
  ];

  async run() {
    const {args, flags} = this.parse(Vcli);
    const reader = this.getReadStream(args.file);

    startServer({
      reader,
      logger: this.log.bind(this),
      dev: Boolean(flags.dev),
    });
  }

  // async parseInput(file: string | undefined  | null) {
  //   const rs = this.getReadStream(file);
  //   return new Promise<string[]>((resolve, reject) => {
  //     let header: Row | undefined;
  //     rs.pipe(csvParse())
  //       .on('error', (err) => reject(err))
  //       .on('data', (row) => {
  //         if (!header) {
  //           header = row;
  //           resolve(header);
  //           rs.destroy();
  //         }
  //       });
  //   });
  // }

  getReadStream(file: string | undefined | null): FsReadStream | ReadStream {
    if (file) {
      return fs.createReadStream(path.resolve(file));
    }
    if (process.stdin.isTTY) {
      this.error("vcli did not receive any data, please see 'vcli --help'");
    }
    return process.stdin;
  }
}

export = Vcli;
