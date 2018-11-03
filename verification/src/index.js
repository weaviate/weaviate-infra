// @flow

const fs = require('fs');

const { uniqueNumbersBetween, randomNumbersBetween } = require('./random');
const {
  thingClassFromName, thingFromClass, addReferenceToOtherThingClass,
} = require('./ontology');
const { randomlyFillCrossReferences } = require('./thingsCrossReferences');

const contextionaryFileName = './contextionary.txt';
const numberOfThingClasses = 5;
const numberOfThingVertices = 20;

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


function writeGreen(text) {
  process.stdout.write(`\x1b[32m${text}\x1b[0m\n`);
}

function writeNoBreak(text) {
  process.stdout.write(text);
}

function main() {
  writeNoBreak('Reading contextionary...');
  const words = readWordsFromFile();
  writeGreen(' succesfully parsed contextionary.');

  writeNoBreak('Creating Thing Classes...');
  const thingClasses = createThingClasses(numberOfThingClasses, words);
  writeGreen(` created ${numberOfThingClasses} thing classes without cross-references.`);

  writeNoBreak('Creating Thing Vertices...');
  const thingVertices = createThingVerticies(numberOfThingVertices,
    thingClasses);
  writeGreen(` created ${numberOfThingVertices} thing vertices without cross-references.`);

  thingClasses[0] = addReferenceToOtherThingClass(thingClasses[0], thingClasses[1]);
  const thingVerticesWithRefs = randomlyFillCrossReferences(thingVertices, thingClasses[0]);
  console.log('thing vertices', JSON.stringify(thingVerticesWithRefs, null, 2));
}

main();
