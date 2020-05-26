import sampleSize from 'lodash/sampleSize';
import {DataTypes} from '../types';

export type DataRow = Array<string | number>;
type Data = Array<DataRow>;

export const NULL = 'NULL';

const DATE_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})( (\d{2}):(\d{2}):(\d{2}))?/;
const DATE_SIMPLE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
// let NUM_RE = /^[$|£]?((\d+,)*\d+)(\.\d*)?$/;
const SAMPLE_SIZE = 100;

export default class DataContainer {
  private header: string[];
  private rows: Data;
  private count = 0;

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
          // Client-side number parsing
          // if (isNum && !NUM_RE.test(val)) {
          //   isNum = false;
          //   if (!isDate && !isNum) {
          //     break;
          //   }
          // }
          if (isNum && val != undefined && typeof val !== 'number') {
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

  getTypes() {
    return this.types;
  }

  getRows() {
    return this.rows;
  }
}
