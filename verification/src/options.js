// @flow

const yargs = require('yargs');

type Amounts = {
  thingClasses: number,
  vertices: number,
  crossReferences: number,
}

type Authorization = {
  apiKey: string,
  apiToken: string,
}

type GlobalOptions = {
  amounts: Amounts,
  authorization: Authorization,
}

// non-configurable options
const apiKey = '657a48b9-e000-4d9a-b51d-69a0b621c1b9';
const apiToken = '57ac8392-1ecc-4e17-9350-c9c866ac832b';

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
    authorization: {
      apiKey,
      apiToken,
    },
  };
};
