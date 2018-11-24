// @flow

const fs = require('fs');

const { randomNumbersBetween, uniqueThingAndActionNames } = require('./random');
const { classFromName, vertexFromClass } = require('./ontology');
const { randomlyFillCrossReferences } = require('./thingsVerticesCrossReferences');
const crossReferences = require('./thingsClassesCrossReferences');
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

async function createClasses(options, classNames, words, submitter) {
  log.noBreak('Creating Thing Classes...');
  const schemaClasses = classNames.map(name => classFromName(name, words));
  await submitter(schemaClasses);
  log.green(` created ${schemaClasses.length} classes without cross-references.`);
  return schemaClasses;
}

async function createVertices(options, schemaClasses, submitter, type) {
  const create = amount => (
    randomNumbersBetween(amount, schemaClasses.length)
      .map(i => schemaClasses[i])
      .map(schemaClass => vertexFromClass(schemaClass))
  );

  log.noBreak(`Creating ${type} Vertices...`);
  const vertices = create(options.amounts.vertices);
  log.green(` created ${options.amounts.vertices} ${type} vertices without cross-references.`);

  // submit will return thingVertices enriched with uuids assigned by weaviate
  return submitter(vertices);
}

async function addCrossRefsToClasses(options, thingClasses, submitter) {
  log.noBreak('Creating Cross-References in ontology...');
  const amount = options.amounts.crossReferences;
  const result = crossReferences.randomCrossReferences(amount, thingClasses);
  log.green(` created ${amount} cross-references.`);

  await submitter(result.newReferences);
  return result.schemaClasses;
}

async function populateCrossReferencesForVertices(
  schemaClasses, vertices, submitter, thingOrAction, options, debug,
) {
  const withId = vertex => (!!vertex.uuid);
  let verticesWithRefs = vertices.filter(withId);
  let newReferences = [];
  schemaClasses.forEach((schemaClass) => {
    log.noBreak(`Populating all cross-refs on vertices of class ${schemaClass.class}...`);
    const result = randomlyFillCrossReferences(
      verticesWithRefs, schemaClass, thingOrAction, options,
    );
    debug('result for one vertex after cross-ref population', result);
    verticesWithRefs = result.vertices;
    newReferences = [...newReferences, ...result.newReferences];
    log.green(' done');
  });
  debug('new references to be submitted', newReferences);
  await submitter(newReferences);
  return verticesWithRefs;
}

async function main() {
  const { options, submitter } = await init();
  const debug = log.makeDebugger(options);
  const words = parseContextionary();
  const { thingClassNames, actionClassNames } = uniqueThingAndActionNames(options, words);

  const thingClasses = await createClasses(
    options, thingClassNames, words, submitter.thingClasses,
  );
  debug('Thing Classes after creation/sending', thingClasses);
  const actionClasses = await createClasses(
    options, actionClassNames, words, submitter.actionClasses,
  );
  debug('Action Classes after creation/sending', actionClasses);

  const thingVertices = await createVertices(options, thingClasses, submitter.thingVertices, 'Thing');
  debug('Thing Vertices after creation/sending', thingVertices);
  const actionVertices = await createVertices(options, actionClasses, submitter.actionVertices, 'Action');
  debug('Action Vertices after creation/sending', actionVertices);

  const thingClassesWithRefs = await addCrossRefsToClasses(
    options, thingClasses, submitter.thingClassReferences,
  );
  debug('Thing Classes with cross-references after sending', thingClassesWithRefs);
  const actionClassesWithRefs = await addCrossRefsToClasses(
    options, actionClasses, submitter.actionClassReferences,
  );
  debug('Action Classes with cross-references after sending', actionClassesWithRefs);

  await populateCrossReferencesForVertices(
    thingClassesWithRefs, thingVertices, submitter.thingVerticesReferences, 'Thing', options, debug,
  );

  await populateCrossReferencesForVertices(
    actionClassesWithRefs, actionVertices, submitter.actionVerticesReferences, 'Action', options, debug,
  );

  submitter.printBenchmark();
}


main();
