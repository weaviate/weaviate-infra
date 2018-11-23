// @flow

const fs = require('fs');

const { uniqueNumbersBetween, randomNumbersBetween, uniqueThingAndActionNames } = require('./random');
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

async function createThingClasses(options, classNames, words, submitter) {
  log.noBreak('Creating Thing Classes...');
  const thingClasses = classNames.map(name => thingClassFromName(name, words));
  await submitter.thingClasses(thingClasses);
  log.green(` created ${options.amounts.thingClasses} thing classes without cross-references.`);
  return thingClasses;
}

async function createActionClasses(options, classNames, words, submitter) {
  log.noBreak('Creating Action Classes...');
  const actionClasses = classNames.map(name => thingClassFromName(name, words));
  await submitter.actionClasses(actionClasses);
  log.green(` created ${options.amounts.actionClasses} action classes without cross-references.`);
  return actionClasses;
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

async function populateCrossReferencesForThingVertices(
  thingClasses, thingVertices, submitter, options,
) {
  const withThingId = thing => (!!thing.uuid);
  let thingVerticesWithRefs = thingVertices.filter(withThingId);
  let newReferences = [];
  thingClasses.forEach((thingClass) => {
    log.noBreak(`Populating all cross-refs on vertices of class ${thingClass.class}...`);
    const result = randomlyFillCrossReferences(thingVerticesWithRefs, thingClass, options);
    thingVerticesWithRefs = result.vertices;
    newReferences = [...newReferences, ...result.newReferences];
    log.green(' done');
  });
  await submitter.thingVerticesReferences(newReferences);
  return thingVerticesWithRefs;
}

async function main() {
  const { options, submitter } = await init();
  const words = parseContextionary();
  const { thingClassNames, actionClassNames } = uniqueThingAndActionNames(options, words);

  const thingClasses = await createThingClasses(options, thingClassNames, words, submitter);
  await createActionClasses(options, actionClassNames, words, submitter);
  const thingVertices = await createThingVertices(options, thingClasses, submitter);
  const thingClassesWithRefs = await addCrossRefsToThingClasses(options, thingClasses, submitter);
  await populateCrossReferencesForThingVertices(
    thingClassesWithRefs, thingVertices, submitter, options,
  );

  submitter.printBenchmark();
}


main();
