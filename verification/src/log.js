// @flow

import type { GlobalOptions } from './options';

function green(text: string) {
  process.stdout.write(`\x1b[32m${text}\x1b[0m\n`);
}

function red(text: string) {
  process.stdout.write(`\x1b[31m${text}\x1b[0m\n`);
}

function bold(text: string) {
  process.stdout.write(`\x1b[1m${text}\x1b[0m\n`);
}

function boldNoBreak(text: string) {
  process.stdout.write(`\x1b[1m${text}\x1b[0m`);
}

function normal(text: string) {
  process.stdout.write(`${text}\n`);
}

function noBreak(text: string) {
  process.stdout.write(text);
}

const makeDebugger = (options: GlobalOptions) => (description: string, element: any) => {
  if (!options.modes.debug) {
    return;
  }

  normal('--------------------------------------------------');
  normal(`DEBUG: ${description}`);
  normal('--------------------------------------------------');
  normal(JSON.stringify(element, null, 2));
  normal('--------------------------------------------------');
};

module.exports = {
  green,
  red,
  noBreak,
  bold,
  boldNoBreak,
  normal,
  makeDebugger,
};
