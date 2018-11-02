// @flow

const fs = require('fs');

const { uniqueNumbersBetween, randomNumbersBetween } = require('./random');
const { thingClassFromName, thingFromClass } = require('./ontology');

const contextionaryFileName = './contextionary.txt';
const numberOfThingClasses = 10;
const numberOfThingVertices = 10;

const readWordsFromFile = () => fs
  .readFileSync(contextionaryFileName, 'utf8')
  .split('\n')
  .map(line => line.split(' ')[0]);

const createThingClasses = (amount, words) => (
  uniqueNumbersBetween(amount, words.length - 1)
    .map(wordIndex => thingClassFromName(words[wordIndex], words))
);

const createThingVerticies = (amount, thingClasses) => (
  randomNumbersBetween(amount, thingClasses.length - 1)
    .map(i => thingClasses[i])
    .map(thingClass => thingFromClass(thingClass))
);

function main() {
  const words = readWordsFromFile();
  const thingClasses = createThingClasses(numberOfThingClasses, words);
  const thingVertices = createThingVerticies(numberOfThingVertices,
    thingClasses);
  console.log(JSON.stringify(thingVertices, null, 2));
}

main();
