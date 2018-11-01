// @flow

const fs = require('fs');

const { uniqueNumbersBetween } = require('./random');
const { thingClassFromName } = require('./ontology');

const contextionaryFileName = './contextionary.txt';
const numberOfThings = 10;

const readWordsFromFile = () => fs
  .readFileSync(contextionaryFileName, 'utf8')
  .split('\n')
  .map(line => line.split(' ')[0]);

const createThings = (amount, words) => uniqueNumbersBetween(amount, words.length - 1)
  .map(wordIndex => thingClassFromName(words[wordIndex], words));

function main() {
  const words = readWordsFromFile();
  const things = createThings(numberOfThings, words);
  console.log(JSON.stringify(things, null, 2));
}

main();
