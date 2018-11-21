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
  return `${time}ms`;
}

function headerRow(): Array<string> {
  return ['verb', 'resource', 'benchmark', 'result'];
}

class BenchmarkReporter {
  monitoring: Array<Monitoring>

  constructor(monitoring: Array<Monitoring>) {
    this.monitoring = monitoring;
  }

  filter(verb: string, resource: string): Array<Monitoring> {
    return this.monitoring.filter(item => (
      item.verb === verb && item.resource === resource
    ));
  }

  average(verb: string, resource: string): string {
    const items = this.filter(verb, resource);
    return formatMs(items.reduce((acc, curr) => (
      acc + toMs(curr.hrtime)), 0) / items.length);
  }


  tableRow(verb: string, resource: string, benchmark: string): Array<string> {
    return [
      verb,
      resource,
      benchmark,
      this.average(verb, resource),
    ];
  }

  print() {
    process.stdout.write(table([
      headerRow(),
      this.tableRow('create', 'schema/thing', 'AVERAGE_ALL'),
    ]));
  }
}

module.exports = BenchmarkReporter;
