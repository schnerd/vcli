import sampleSize from 'lodash/sampleSize';
type DataRow = Array<string | number>;
type Data = Array<DataRow>;
export type Stats = Record<string, number>;

export const NULL = '^^NULL^^';

export enum DataTypes {
  date,
  num,
  text,
}

let DATE_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})( (\d{2}):(\d{2}):(\d{2}))?/;
let DATE_SIMPLE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
let NUM_RE = /^[$|£]?((\d+,)*\d+)(\.\d*)?$/;
let SAMPLE_SIZE = 100;

export default class DataContainer {
  private header: string[];
  private rows: Data;
  private overview: any[] | null = null;
  private count: number = 0;

  private _didDetection = false;
  private types: DataTypes[] = [];

  constructor(data: Data) {
    this.header = data[0] as string[];
    this.rows = data.slice(1);
    this.count = this.rows.length;
    this.detect();
  }

  detect() {
    if (this._didDetection) {
      return;
    }

    const sample = sampleSize(this.rows, SAMPLE_SIZE);

    this.types = this.header.map(
      (field, i): DataTypes => {
        let isDate = true;
        let isNum = true;

        let row;
        let val;
        for (let r = 0; r < SAMPLE_SIZE; r++) {
          row = sample[r];
          val = row[i];
          if (isDate && !DATE_TIME_RE.test(val) && !DATE_SIMPLE_RE.test(val)) {
            isDate = false;
            if (!isDate && !isNum) {
              break;
            }
          }
          if (isNum && !NUM_RE.test(val)) {
            isNum = false;
            if (!isDate && !isNum) {
              break;
            }
          }
        }

        if (isDate) {
          return DataTypes.date;
        }
        if (isNum) {
          return DataTypes.num;
        }
        return DataTypes.text;
      },
    );

    this._didDetection = true;
  }

  getHeader() {
    return this.header;
  }

  getOverview() {
    if (this.overview) {
      return this.overview;
    }

    let overview = this.header.map(() => ({}));

    let cols = this.header.length;
    for (let i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      for (let j = 0; j < cols; j++) {
        let val = row[j];
        if (val == undefined) {
          val = NULL;
        }

        let stat = overview[j];
        if (!stat[val]) {
          stat[val] = 0;
        }
        stat[val]++;
      }
    }

    this.overview = overview;
    return overview;
  }

  getTypes() {
    return this.types;
  }
}
