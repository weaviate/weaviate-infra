// @flow

const fs = require('fs');

const { uniqueNumbersBetween, randomNumbersBetween } = require('./random');
const { thingClassFromName, thingFromClass } = require('./ontology');
const { randomlyFillCrossReferences } = require('./thingsVerticesCrossReferences');
const thingClassReferences = require('./thingsClassesCrossReferences');
const parseOptions = require('./options');
const createSwaggerClient = require('./swagger');
const Submitter = require('./submitters');
const log = require('./log');

const contextionaryFileName = './contextionary.txt';


async function init() {
  const options = parseOptions();
  const client = await createSwaggerClient(options);
  const submitter = new Submitter(client);

  return { options, submitter };
}

function parseContextionary() {
  const removeWordsWithSpecialChars = w => (w.match(/^[A-Za-z]+$/));
  const readWordsFromFile = () => fs
    .readFileSync(contextionaryFileName, 'utf8')
    .split('\n')
    .map(line => line.split(' ')[0])
    .filter(removeWordsWithSpecialChars);

  log.noBreak('Reading contextionary...');
  const words = readWordsFromFile();
  log.green(' succesfully parsed contextionary.');

  return words;
}

async function createThingClasses(options, words, submitter) {
  log.noBreak('Creating Thing Classes...');

  const amount = options.amounts.thingClasses;
  const thingClasses = uniqueNumbersBetween(amount, words.length - 1)
    .map(wordIndex => thingClassFromName(words[wordIndex], words));

  await submitter.thingClasses(thingClasses);
  log.green(` created ${options.amounts.thingClasses} thing classes without cross-references.`);
  return thingClasses;
}

async function createThingVertices(options, thingClasses, submitter) {
  const create = amount => (
    randomNumbersBetween(amount, thingClasses.length)
      .map(i => thingClasses[i])
      .map(thingClass => thingFromClass(thingClass))
  );

  log.noBreak('Creating Thing Vertices...');
  const thingVertices = create(options.amounts.vertices);
  log.green(` created ${options.amounts.vertices} thing vertices without cross-references.`);

  // submit will return thingVertices enriched with uuids assigned by weaviate
  return submitter.thingVertices(thingVertices);
}

async function addCrossRefsToThingClasses(options, thingClasses, submitter) {
  log.noBreak('Creating Cross-References in ontology...');
  const amount = options.amounts.crossReferences;
  const result = thingClassReferences.randomCrossReferences(amount, thingClasses);
  log.green(` created ${amount} cross-references.`);

  await submitter.thingClassReferences(result.newReferences);
  return result.thingClasses;
}

async function populateCrossReferencesForThingVertices(thingClasses, thingVertices, submitter) {
  const withThingId = thing => (!!thing.uuid);
  let thingVerticesWithRefs = thingVertices.filter(withThingId);
  let newThingReferences = [];
  thingClasses.forEach((thingClass) => {
    log.noBreak(`Populating all cross-refs on vertices of class ${thingClass.class}...`);
    const {
      vertices: updatedThingVertices, newReferences: newThingReferencesThisIteration,
    } = randomlyFillCrossReferences(thingVerticesWithRefs, thingClass);
    thingVerticesWithRefs = updatedThingVertices;
    newThingReferences = [...newThingReferences, ...newThingReferencesThisIteration];
    log.green(' done');
  });
  await submitter.thingVerticesReferences(newThingReferences);
  return thingVerticesWithRefs;
}

async function main() {
  const { options, submitter } = await init();
  const words = parseContextionary();

  const thingClasses = await createThingClasses(options, words, submitter);
  const thingVertices = await createThingVertices(options, thingClasses, submitter);
  const thingClassesWithRefs = await addCrossRefsToThingClasses(options, thingClasses, submitter);
  await populateCrossReferencesForThingVertices(thingClassesWithRefs, thingVertices, submitter);

  submitter.printStatus();
}


main();
