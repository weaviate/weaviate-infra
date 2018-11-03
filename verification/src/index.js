// @flow

const fs = require('fs');

const { uniqueNumbersBetween, randomNumbersBetween } = require('./random');
const { thingClassFromName, thingFromClass } = require('./ontology');
const { randomlyFillCrossReferences } = require('./thingsVerticesCrossReferences');
const thingClassReferences = require('./thingsClassesCrossReferences');

const contextionaryFileName = './contextionary.txt';
const numberOfThingClasses = 5;
const numberOfThingVertices = 20;
const numberOfThingCrossRefs = 5;

const readWordsFromFile = () => fs
  .readFileSync(contextionaryFileName, 'utf8')
  .split('\n')
  .map(line => line.split(' ')[0]);

const createThingClasses = (amount, words) => (
  uniqueNumbersBetween(amount, words.length - 1)
    .map(wordIndex => thingClassFromName(words[wordIndex], words))
);

const createThingVerticies = (amount, thingClasses) => (
  randomNumbersBetween(amount, thingClasses.length)
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

  writeNoBreak('Creating Cross-References in ontology...');
  const thingClassesWithRefs = thingClassReferences.randomCrossReferences(
    numberOfThingCrossRefs, thingClasses,
  );
  writeGreen(` created ${numberOfThingCrossRefs} cross-references.`);

  let thingVerticesWithRefs = thingVertices;
  thingClassesWithRefs.forEach((thingClass) => {
    writeNoBreak(`Populating all cross-refs on vertices of class ${thingClass.class}...`);
    thingVerticesWithRefs = randomlyFillCrossReferences(thingVerticesWithRefs, thingClass);
    writeGreen(' done');
  });

  writeGreen('\nDone. Here are 20 random thing vertices:');
  console.log(JSON.stringify(
    uniqueNumbersBetween(10, thingVerticesWithRefs.length).map(i => thingVerticesWithRefs[i]),
    null,
    2,
  ));
}

main();
