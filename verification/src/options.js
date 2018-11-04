// @flow

const yargs = require('yargs');

type Amounts = {
  thingClasses: number,
  vertices: number,
  crossReferences: number,
}

type GlobalOptions = {
  amounts: Amounts,
}

module.exports = function parse(): GlobalOptions {
  const { argv } = yargs
    .usage('Usage: $0 <command> [options]')
    .command('generate', 'Generate dummy data based on options')
    .demandCommand(1)
    .example('$0 generate -t 10 -r 10 -v 200',
      'generate 10 things in the ontology, add a total of 10 cross-references'
      + ' and create 200 vertices (things and actions)')
    .alias('v', 'vertices')
    .describe('v', 'Number of vertices (Things and Actions) to be generated')
    .alias('t', 'thing-classes')
    .describe('t', 'Number of Thing Classes in the ontology')
    .alias('r', 'cross-references')
    .describe('r', 'Number of Classes that cross-references other classes')
    .demandOption(['v', 't', 'r'])
    .help('h')
    .alias('h', 'help');

  return {
    amounts: {
      thingClasses: argv.t,
      vertices: argv.v,
      crossReferences: argv.r,
    },
  };
};
