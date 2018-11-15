// @flow

const fs = require('fs');

const { uniqueNumbersBetween, randomNumbersBetween } = require('./random');
const { thingClassFromName, thingFromClass } = require('./ontology');
const { randomlyFillCrossReferences } = require('./thingsVerticesCrossReferences');
const thingClassReferences = require('./thingsClassesCrossReferences');
const parseOptions = require('./options');
const createSwaggerClient = require('./swagger');

const contextionaryFileName = './contextionary.txt';

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

async function main() {
  const options = parseOptions();

  writeNoBreak('Reading contextionary...');
  const words = readWordsFromFile();
  writeGreen(' succesfully parsed contextionary.');

  writeNoBreak('Creating Thing Classes...');
  const thingClasses = createThingClasses(options.amounts.thingClasses, words);
  writeGreen(` created ${options.amounts.thingClasses} thing classes without cross-references.`);

  writeNoBreak('Creating Thing Vertices...');
  const thingVertices = createThingVerticies(options.amounts.vertices, thingClasses);
  writeGreen(` created ${options.amounts.vertices} thing vertices without cross-references.`);

  writeNoBreak('Creating Cross-References in ontology...');
  const thingClassesWithRefs = thingClassReferences.randomCrossReferences(
    options.amounts.crossReferences, thingClasses,
  );
  writeGreen(` created ${options.amounts.crossReferences} cross-references.`);

  let thingVerticesWithRefs = thingVertices;
  thingClassesWithRefs.forEach((thingClass) => {
    writeNoBreak(`Populating all cross-refs on vertices of class ${thingClass.class}...`);
    thingVerticesWithRefs = randomlyFillCrossReferences(thingVerticesWithRefs, thingClass);
    writeGreen(' done');
  });

  // writeGreen('\nDone. Here are 20 random thing vertices:');
  // console.log(JSON.stringify(
  //   uniqueNumbersBetween(10, thingVerticesWithRefs.length).map(i => thingVerticesWithRefs[i]),
  //   null,
  //   2,
  // ));
  //

  // const client = await createSwaggerClient(options);

  // client
  //   .apis
  //   .schema
  //   .weaviate_schema_things_create({
  //     thingClass: {
  //       class: 'Car',
  //       description: 'Foo',
  //       properties: [],
  //       keywords: [],
  //     },
  //   })
  //   .then(res => console.log(res))
  //   .catch(err => console.error(err));
}


main();
