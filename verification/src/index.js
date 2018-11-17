// @flow

const fs = require('fs');

const { uniqueNumbersBetween, randomNumbersBetween } = require('./random');
const { thingClassFromName, thingFromClass } = require('./ontology');
const { randomlyFillCrossReferences } = require('./thingsVerticesCrossReferences');
const thingClassReferences = require('./thingsClassesCrossReferences');
const parseOptions = require('./options');
const createSwaggerClient = require('./swagger');
const submit = require('./submitters');

const contextionaryFileName = './contextionary.txt';

const removeWordsWithSpecialChars = w => (w.match(/^[A-Za-z]+$/));

const readWordsFromFile = () => fs
  .readFileSync(contextionaryFileName, 'utf8')
  .split('\n')
  .map(line => line.split(' ')[0])
  .filter(removeWordsWithSpecialChars);

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

function writeRed(text) {
  process.stdout.write(`\x1b[31m${text}\x1b[0m\n`);
}

function writeNoBreak(text) {
  process.stdout.write(text);
}

async function main() {
  const options = parseOptions();
  const client = await createSwaggerClient(options);

  writeNoBreak('Reading contextionary...');
  const words = readWordsFromFile();
  writeGreen(' succesfully parsed contextionary.');

  writeNoBreak('Creating Thing Classes...');
  const thingClasses = createThingClasses(options.amounts.thingClasses, words);
  writeGreen(` created ${options.amounts.thingClasses} thing classes without cross-references.`);
  await submit.thingClasses(client, thingClasses, writeGreen, writeRed);

  writeNoBreak('Creating Thing Vertices...');
  let thingVertices = createThingVerticies(options.amounts.vertices, thingClasses);
  writeGreen(` created ${options.amounts.vertices} thing vertices without cross-references.`);
  thingVertices = await submit.thingVertices(client, thingVertices, writeGreen, writeRed);

  writeNoBreak('Creating Cross-References in ontology...');
  const {
    thingClasses: thingClassesWithRefs, newReferences,
  } = thingClassReferences.randomCrossReferences(
    options.amounts.crossReferences, thingClasses,
  );
  writeGreen(` created ${options.amounts.crossReferences} cross-references.`);
  await submit.thingClassReferences(client, newReferences, writeGreen, writeRed);

  const withThingId = thing => (!!thing.uuid);
  let thingVerticesWithRefs = thingVertices.filter(withThingId);
  let newThingReferences = [];
  thingClassesWithRefs.forEach((thingClass) => {
    writeNoBreak(`Populating all cross-refs on vertices of class ${thingClass.class}...`);
    const {
      vertices: updatedThingVertices, newReferences: newThingReferencesThisIteration,
    } = randomlyFillCrossReferences(thingVerticesWithRefs, thingClass);
    thingVerticesWithRefs = updatedThingVertices;
    newThingReferences = [...newThingReferences, ...newThingReferencesThisIteration];
    writeGreen(' done');
  });
  await submit.thingVerticesReferences(client, newThingReferences, writeGreen, writeRed);
}


main();
