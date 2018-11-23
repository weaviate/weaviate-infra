// @flow

import type { GlobalOptions } from './options';

const log = require('./log');

type ThingAndActionWords = {
  thingClassNames: Array<string>,
  actionClassNames: Array<string>,
}

const uniqueNumbersBetween = (amount: number, end: number, start: number = 0): Array<number> => {
  const numbers = [];
  while (numbers.length < amount) {
    const newNumber = Math.floor(Math.random() * (end - start) + start);
    if (numbers.indexOf(newNumber) === -1) numbers.push(newNumber);
  }
  return numbers.sort((a, b) => a - b);
};

const randomNumbersBetween = (amount: number, end: number, start: number = 0): Array<number> => {
  const numbers = [];
  while (numbers.length < amount) {
    const newNumber = Math.floor(Math.random() * (end - start) + start);
    numbers.push(newNumber);
  }
  return numbers.sort((a, b) => a - b);
};

const uniqueThingAndActionNames = (
  options: GlobalOptions, words: Array<string>,
): ThingAndActionWords => {
  const things = options.amounts.thingClasses;
  const actions = options.amounts.actionClasses;

  if ((things + actions) > words.length) {
    log.red(`ERROR:\n\tDesired number of things (${things}) and actions ${actions} (total: ${things + actions}) `
    + `is larger than the number of usable words in the contextionary (${words.length})`);
    process.exit(1);
  }

  const thingAndActionNameIndices = uniqueNumbersBetween(things + actions, words.length);
  const thingIndices = thingAndActionNameIndices.slice(0, things);
  const actionIndices = thingAndActionNameIndices.slice(things);

  return {
    thingClassNames: thingIndices.map(wordIndex => words[wordIndex]),
    actionClassNames: actionIndices.map(wordIndex => words[wordIndex]),
  };
};

module.exports = { uniqueNumbersBetween, randomNumbersBetween, uniqueThingAndActionNames };
