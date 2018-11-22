// @flow

const table = require('markdown-table');

export type Hrtime = [number, number]

export type Monitoring = {
  verb: string,
  resource: string,
  hrtime: Hrtime,
  success: boolean,
}

function toMs(elapsed: Hrtime): number {
  return Math.floor(elapsed[0] * 1000 + elapsed[1] / 1000000);
}

function formatMs(time: number): string {
  if (`${time}` === 'NaN') { return 'n/a'; }
  return `${Math.floor(time)} ms`;
}

function headerRow(): Array<string> {
  return ['verb', 'resource', 'benchmark', 'result'];
}

const tableRow = (
  verb: string, resource: string, benchmark: string, calculate: Function,
): Array<string> => [
  verb,
  resource,
  benchmark,
  calculate(verb, resource),
];

const averageTime = items => items.reduce((acc, curr) => (
  acc + toMs(curr.hrtime)), 0) / items.length;

const min = (acc, curr) => ((curr < acc) ? curr : acc);
const fastestTime = items => items.map(i => toMs(i.hrtime)).reduce(min);
const max = (acc, curr) => ((curr > acc) ? curr : acc);
const slowestTime = items => items.map(i => toMs(i.hrtime)).reduce(max);

class BenchmarkReporter {
  monitoring: Array<Monitoring>

  constructor(monitoring: Array<Monitoring>) {
    this.monitoring = monitoring;
    // this.successRate = this.successRate.bind(this);
    this.averageAll = this.averageAll.bind(this);
    this.averageSuccessful = this.averageSuccessful.bind(this);
    this.averageFailed = this.averageFailed.bind(this);
    this.fastestAll = this.fastestAll.bind(this);
    this.slowestSuccessful = this.slowestSuccessful.bind(this);
    this.slowestFailed = this.slowestFailed.bind(this);
    this.slowestAll = this.slowestAll.bind(this);
    this.fastestSuccessful = this.fastestSuccessful.bind(this);
    this.fastestFailed = this.fastestFailed.bind(this);
  }

  filter(verb: string, resource: string): Array<Monitoring> {
    return this.monitoring.filter(item => (
      item.verb === verb && item.resource === resource
    ));
  }

  averageAll(verb: string, resource: string): string {
    const items = this.filter(verb, resource);
    return formatMs(averageTime(items));
  }

  averageSuccessful(verb: string, resource: string): string {
    const items = this.filter(verb, resource)
      .filter(i => !!i.success);
    return formatMs(averageTime(items));
  }

  averageFailed(verb: string, resource: string): string {
    const items = this.filter(verb, resource)
      .filter(i => !i.success);
    return formatMs(averageTime(items));
  }

  slowestAll(verb: string, resource: string): string {
    const items = this.filter(verb, resource);
    try {
      return formatMs(slowestTime(items));
    } catch (e) {
      return 'n/a';
    }
  }

  slowestSuccessful(verb: string, resource: string): string {
    const items = this.filter(verb, resource)
      .filter(i => !!i.success);
    try {
      return formatMs(slowestTime(items));
    } catch (e) {
      return 'n/a';
    }
  }

  slowestFailed(verb: string, resource: string): string {
    const items = this.filter(verb, resource)
      .filter(i => !i.success);
    try {
      return formatMs(slowestTime(items));
    } catch (e) {
      return 'n/a';
    }
  }

  fastestAll(verb: string, resource: string): string {
    const items = this.filter(verb, resource);
    try {
      return formatMs(fastestTime(items));
    } catch (e) {
      return 'n/a';
    }
  }

  fastestSuccessful(verb: string, resource: string): string {
    const items = this.filter(verb, resource)
      .filter(i => !!i.success);
    try {
      return formatMs(fastestTime(items));
    } catch (e) {
      return 'n/a';
    }
  }

  fastestFailed(verb: string, resource: string): string {
    const items = this.filter(verb, resource)
      .filter(i => !i.success);
    try {
      return formatMs(fastestTime(items));
    } catch (e) {
      return 'n/a';
    }
  }

  successRate = (verb: string, resource: string): string => {
    const all = this.filter(verb, resource);
    const success = all.filter(i => !!i.success);

    return `${(success.length / all.length * 100).toFixed(2)} %`;
  }

  tableRowGroup(verb: string, resource: string): Array<Array<string>> {
    return [
      tableRow(verb, resource, 'SUCCESS_RATE', this.successRate),
      tableRow(verb, resource, 'AVERAGE_ALL', this.averageAll),
      tableRow(verb, resource, 'AVERAGE_SUCCESS', this.averageSuccessful),
      tableRow(verb, resource, 'AVERAGE_FAILURE', this.averageFailed),
      tableRow(verb, resource, 'FASTEST_ALL', this.fastestAll),
      tableRow(verb, resource, 'FASTEST_SUCCESS', this.fastestSuccessful),
      tableRow(verb, resource, 'FASTEST_FAILURE', this.fastestFailed),
      tableRow(verb, resource, 'SLOWEST_ALL', this.slowestAll),
      tableRow(verb, resource, 'SLOWEST_SUCCESS', this.slowestSuccessful),
      tableRow(verb, resource, 'SLOWEST_FAILURE', this.slowestFailed),
    ];
  }


  print() {
    process.stdout.write(table([
      headerRow(),
      ...this.tableRowGroup('create', 'schema/thing'),
      ...this.tableRowGroup('create', 'schema/thing/property'),
      ...this.tableRowGroup('create', 'thing'),
      ...this.tableRowGroup('patch (add cross-ref)', 'thing'),
    ]));
  }
}

module.exports = BenchmarkReporter;
