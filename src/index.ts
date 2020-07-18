import {Command, flags} from '@oclif/command';
import csvParse from 'csv-parse';
import fs, {ReadStream as FsReadStream} from 'fs';
import path from 'path';
import {DateAggType, NumAggType} from './client/types';
import {startServer} from './server';
import {ChartConfig, DataFrame, DataResponse} from './types';
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
const Y_AGG_RE = /:(count|min|max|sum|mean|median|p5|p95)$/;

const initialChartConfig: ChartConfig = {
  x: null,
  y: null,
  yAgg: null,
  dateAgg: null,
  facet: null,
};

class Vcli extends Command {
  private reader!: FsReadStream | ReadStream;
  private chartConfig: ChartConfig = initialChartConfig;
  private args!: any;
  private flags!: any;
  private data!: DataFrame;
  // Promise for when args/flags validation is complete and server can be started
  private validatePromise!: Promise<void>;
  // Promise for when input is fully parsed and data object is ready
  private dataPromise!: Promise<DataResponse>;

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

    // Easier to store these than pass them around everywhere
    this.args = args;
    this.flags = flags;

    // Create a ReadableStream for the input file / stdin
    this.reader = this.getReadStream();

    this.parseInput();

    try {
      await this.validatePromise;
    } catch (error) {
      this.error(error.message);
    }

    startServer({
      logger: this.log.bind(this),
      dev: Boolean(flags.dev),
      data: this.dataPromise,
    });
  }

  getFileName(): string | undefined {
    return this.args.file ? path.basename(this.args.file) : undefined;
  }

  getReadStream(): FsReadStream | ReadStream {
    const file: string | undefined | null = this.args.file;
    if (file) {
      return fs.createReadStream(path.resolve(file));
    }
    if (process.stdin.isTTY) {
      this.error("vcli did not receive any data, please see 'vcli --help'");
    }
    return process.stdin;
  }

  parseHeaderRow(header: string[]) {
    let xFlag = this.flags[X_FLAG];
    let yFlag = this.flags[Y_FLAG];
    const facetFlag = this.flags.facet;
    let dateAgg: DateAggType | undefined;
    let yAgg: NumAggType | undefined;
    if (yFlag && !xFlag) {
      throw new Error('You must also specify an x-axis value using -x');
    } else if (xFlag && !yFlag) {
      throw new Error('You must also specify a y-axis value using -y');
    } else if (facetFlag && (!xFlag || !yFlag)) {
      throw new Error('You must also pass -x and -y flags to create faceted charts');
    }

    // If no args passed, we'll just end up showing overview tab
    if (!xFlag && !yFlag && !facetFlag) {
      return;
    }

    // Get the CSV header row

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

    const xFlagIndex = coerceToIndex(xFlag);
    if (xFlagIndex === null) {
      throw new Error(`Could not locate column "${xFlag}" for x-axis`);
    }
    const yFlagIndex = coerceToIndex(yFlag);
    if (yFlagIndex === null) {
      throw new Error(`Could not locate column "${yFlag}" for y-axis`);
    }

    let facetFlagIndex = null;
    if (facetFlag) {
      facetFlagIndex = coerceToIndex(facetFlag);
      if (facetFlagIndex === null) {
        throw new Error(`"${facetFlag}" is not a valid facet column`);
      }
    }

    this.chartConfig = {
      x: xFlagIndex,
      y: yFlagIndex,
      facet: facetFlag == undefined ? null : facetFlagIndex,
      dateAgg: dateAgg == undefined ? null : dateAgg,
      yAgg: yAgg == undefined ? null : yAgg,
    };
  }

  parseInput() {
    // This is kind of strange, but we need two nested promises to achieve the desired behavior:
    // - When args/flag validation is complete, validation promise should be resolved
    // - When data is fully parsed and ready to be sent to frontend
    // These are not mutually exclusive tasks – they both happen during the data processing phase.
    this.validatePromise = new Promise((resolveValidation, rejectValidation) => {
      this.dataPromise = new Promise((resolveData, rejectData) => {
        const data: any[] = [];
        let isFirstRow = true;
        this.reader
          .pipe(
            csvParse({
              cast: true,
              cast_date: false,
            }),
          )
          .on('error', (error) => {
            rejectData(error);
          })
          .on('data', (row) => {
            if (isFirstRow) {
              try {
                this.parseHeaderRow(row);
              } catch (error) {
                rejectValidation(error);
                this.reader.destroy();
              }
              isFirstRow = false;
              resolveValidation();
            }
            data.push(row);
          })
          .on('end', () => {
            const response: DataResponse = {
              data,
              chartConfig: this.chartConfig,
              file: this.getFileName() || null,
            };
            resolveData(response);
          });
      });
    });
  }
}

export = Vcli;
