import {Command, flags} from '@oclif/command';
import csvParse from 'csv-parse';
import fs, {ReadStream as FsReadStream} from 'fs';
import path from 'path';
import {DateAggType, NumAggType} from './client/types';
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

const X_FLAG = 'x-axis';
const Y_FLAG = 'y-axis';

const X_AGG_RE = /:(day|month|year)$/;
const Y_AGG_RE = /:(min|max|sum|mean|median|p5|p95)$/;

class Vcli extends Command {
  static description = 'Quickly visualize CSV data';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    [X_FLAG]: flags.string({
      char: 'x',
      description:
        'Column index/name to plot on x-axis of charts. For date fields you can specify an aggregate function like start_date:month (supports day/month/year)',
    }),
    [Y_FLAG]: flags.string({
      char: 'y',
      description:
        'Column index/name to plot on y-axis of charts. You can also specify an aggregate function like sales:sum (supports min/max/sum/mean/median/p5/p95)',
    }),
    facet: flags.string({
      description: 'Column index/name that will be used to group data into separate charts',
    }),
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

    const chartConfig = await this.parseChartFlags(args, flags);

    const reader = this.getReadStream(args.file);
    startServer({
      reader,
      chartConfig,
      logger: this.log.bind(this),
      file: args.file ? path.basename(args.file) : undefined,
      dev: Boolean(flags.dev),
    });
  }

  getReadStream(file: string | undefined | null): FsReadStream | ReadStream {
    if (file) {
      return fs.createReadStream(path.resolve(file));
    }
    if (process.stdin.isTTY) {
      this.error("vcli did not receive any data, please see 'vcli --help'");
    }
    return process.stdin;
  }

  async parseChartFlags(args: any, flags: any) {
    let xFlag = flags[X_FLAG];
    let yFlag = flags[Y_FLAG];
    let facetFlag = flags.facet;
    let dateAgg: DateAggType | undefined;
    let yAgg: NumAggType | undefined;
    if (yFlag && !xFlag) {
      this.error('You must also specify an x-axis value using -x');
    } else if (xFlag && !yFlag) {
      this.error('You must also specify a y-axis value using -y');
    } else if (facetFlag && (!xFlag || !yFlag)) {
      this.error('You must also pass -x and -y flags to create faceted charts');
    }

    // If no args passed, we'll just end up showing overview tab
    if (!xFlag && !yFlag && !facetFlag) {
      return null;
    }

    // Get the CSV header row
    const reader = this.getReadStream(args.file);
    const header = await new Promise<string[]>((resolve, reject) => {
      let headerRow: string[] = [];
      reader
        .pipe(csvParse({to_line: 1}))
        .on('error', (error) => {
          reject(error);
        })
        .on('data', (row) => {
          headerRow = row;
        })
        .on('end', () => {
          resolve(headerRow);
        });
    });
    reader.destroy();

    const columnIndexes: Record<string, number> = {};
    header.forEach((col, i) => {
      columnIndexes[col] = i;
    });

    const xAggMatch = xFlag.match(X_AGG_RE);
    if (xAggMatch) {
      const aggFn = xAggMatch[1];
      xFlag = xFlag.replace(X_AGG_RE, '');
      dateAgg = Number(DateAggType[aggFn]) as DateAggType;
    }

    const yAggMatch = yFlag.match(Y_AGG_RE);
    if (yAggMatch) {
      const aggFn = yAggMatch[1];
      yFlag = yFlag.replace(Y_AGG_RE, '');
      yAgg = Number(NumAggType[aggFn]) as NumAggType;
    }

    const coerceToIndex = (str: string) => {
      if (columnIndexes[str] !== undefined) {
        return columnIndexes[str];
      }
      if (/^\d+$/.test(str)) {
        return parseInt(str, 10);
      }
      return null;
    };

    xFlag = coerceToIndex(xFlag);
    if (xFlag === null) {
      this.error(`Could not find locate column "${xFlag}" for x-axis`);
    }
    yFlag = coerceToIndex(yFlag);
    if (yFlag === null) {
      this.error(`Could not find locate column "${yFlag}" for y-axis`);
    }
    if (facetFlag) {
      facetFlag = coerceToIndex(facetFlag);
      if (facetFlag === null) {
        this.error(`"${facetFlag}" is not a valid y-axis column`);
      }
    }

    return {
      x: xFlag,
      y: yFlag,
      facet: facetFlag,
      dateAgg,
      yAgg,
    };
  }
}

export = Vcli;
