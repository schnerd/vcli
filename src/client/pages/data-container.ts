type DataRow = Array<string | number>;
type Data = Array<DataRow>;
export type Stats = Record<string, number>;

export const NULL = '^^NULL^^';

export default class DataContainer {
  private header: string[];
  private rows: Data;
  private stats: any[] = [];

  constructor(data: Data) {
    this.header = data[0] as string[];
    this.rows = data.slice(1);
    // Initialize stats to empty object
    this.stats = this.header.map(() => ({}));
    this.parse();
  }

  parse() {
    let cols = this.header.length;
    for (let i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      for (let j = 0; j < cols; j++) {
        let val = row[j];
        if (val == undefined) {
          val = NULL;
        }

        let stat = this.stats[j];
        if (!stat[val]) {
          stat[val] = 0;
        }
        stat[val]++;
      }
    }
  }

  getHeader() {
    return this.header;
  }

  getStats() {
    return this.stats;
  }
}
