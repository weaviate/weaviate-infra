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
  }

  all = (verb: string, resource: string): Array<Monitoring> => this
    .monitoring.filter(item => (
      item.verb === verb && item.resource === resource
    ))

  successful = (verb: string, resource: string): Array<Monitoring> => this
    .all(verb, resource)
    .filter(i => !!i.success)

  failed = (verb: string, resource: string): Array<Monitoring> => this
    .all(verb, resource)
    .filter(i => !i.success)

  successRate = (verb: string, resource: string): string => {
    const all = this.all(verb, resource);
    const success = this.successful(verb, resource);

    return `${(success.length / all.length * 100).toFixed(2)} %`;
  }

  timeSet = (filterFn: Function, calculaterFn: Function) => (verb: string, resource: string) => {
    try {
      return formatMs(calculaterFn(filterFn(verb, resource)));
    } catch (e) {
      return 'n/a';
    }
  }

  tableRowGroup(verb: string, resource: string): Array<Array<string>> {
    return [
      tableRow(verb, resource, 'SUCCESS_RATE', this.successRate),
      tableRow(verb, resource, 'AVERAGE_ALL', this.timeSet(this.all, averageTime)),
      tableRow(verb, resource, 'AVERAGE_SUCCESS', this.timeSet(this.successful, averageTime)),
      tableRow(verb, resource, 'AVERAGE_FAILURE', this.timeSet(this.failed, averageTime)),
      tableRow(verb, resource, 'FASTEST_ALL', this.timeSet(this.all, fastestTime)),
      tableRow(verb, resource, 'FASTEST_SUCCESS', this.timeSet(this.successful, fastestTime)),
      tableRow(verb, resource, 'FASTEST_FAILURE', this.timeSet(this.failed, fastestTime)),
      tableRow(verb, resource, 'SLOWEST_ALL', this.timeSet(this.all, slowestTime)),
      tableRow(verb, resource, 'SLOWEST_SUCCESS', this.timeSet(this.successful, slowestTime)),
      tableRow(verb, resource, 'SLOWEST_FAILURE', this.timeSet(this.failed, slowestTime)),
    ];
  }


  print() {
    process.stdout.write(table([
      headerRow(),
      ...this.tableRowGroup('create', 'schema/thing'),
      ...this.tableRowGroup('create', 'schema/thing/property'),
      ...this.tableRowGroup('create', 'thing'),
      ...this.tableRowGroup('create', 'schema/action'),
      ...this.tableRowGroup('create', 'schema/action/property'),
      ...this.tableRowGroup('create', 'action'),
      ...this.tableRowGroup('patch (add cross-ref)', 'thing'),
      ...this.tableRowGroup('patch (add cross-ref)', 'action'),
      ...this.tableRowGroup('get', 'thing'),
      ...this.tableRowGroup('get', 'action'),
    ]));
  }
}

module.exports = BenchmarkReporter;
