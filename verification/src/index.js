// @flow

import type { GlobalOptions } from './options';

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

class Verifier {
  options: GlobalOptions

  submitter: Submitter

  client: any

  words: Array<string>

  thingClassNames: Array<string>

  actionClassNames: Array<string>

  debug: (description: string, element: any) => void

  constructor() {
    this.options = parseOptions();
    this.debug = log.makeDebugger(this.options);
  }

  async initSwaggerClient() {
    this.client = await createSwaggerClient(this.options);
    this.submitter = new Submitter(this.client);
  }

  initContextionary() {
    this.words = parseContextionary();
  }

  initClassNames() {
    const {
      thingClassNames, actionClassNames,
    } = uniqueThingAndActionNames(this.options, this.words);
    this.thingClassNames = thingClassNames;
    this.actionClassNames = actionClassNames;
  }

  async init() {
    this.initContextionary();
    await this.initSwaggerClient();
    this.initClassNames();
  }

  async createClasses(classNames, submitter, thingOrAction) {
    log.noBreak('Creating Thing Classes...');
    const schemaClasses = classNames.map(name => classFromName(name, this.words));
    await submitter(schemaClasses);
    log.green(` created ${schemaClasses.length} classes without cross-references.`);
    this.debug(`${thingOrAction} classes after creation/sending`, schemaClasses);
    return schemaClasses;
  }

  createThingClasses() {
    return this.createClasses(
      this.thingClassNames, this.submitter.thingClasses, 'thing',
    );
  }

  createActionClasses() {
    return this.createClasses(
      this.actionClassNames, this.submitter.actionClasses, 'action',
    );
  }

  async createVertices(schemaClasses, submitter, type) {
    const create = amount => (
      randomNumbersBetween(amount, schemaClasses.length)
        .map(i => schemaClasses[i])
        .map(schemaClass => vertexFromClass(schemaClass))
    );

    log.noBreak(`Creating ${type} Vertices...`);
    const vertices = create(this.options.amounts.vertices);
    log.green(` created ${this.options.amounts.vertices} ${type} vertices without cross-references.`);

    this.debug(`${type} Vertices after creation/sending`, vertices);
    // submit will return thingVertices enriched with uuids assigned by weaviate
    return submitter(vertices);
  }

  createThingVertices(classes) {
    return this.createVertices(classes, this.submitter.thingVertices, 'Thing');
  }

  createActionVertices(classes) {
    return this.createVertices(classes, this.submitter.actionVertices, 'Action');
  }

  async addCrossRefsToClasses(schemaClasses, submitter, thingOrAction) {
    log.noBreak('Creating Cross-References in ontology...');
    const amount = this.options.amounts.crossReferences;
    const result = crossReferences.randomCrossReferences(amount, schemaClasses);
    log.green(` created ${amount} cross-references.`);

    await submitter(result.newReferences);
    this.debug(`${thingOrAction} classes with cross-references after sending`, result.schemaClasses);
    return result.schemaClasses;
  }

  addCrossReferencesToThingClasses(classes) {
    return this.addCrossRefsToClasses(classes, this.submitter.thingClassReferences, 'thing');
  }

  addCrossReferencesToActionClasses(classes) {
    return this.addCrossRefsToClasses(classes, this.submitter.actionClassReferences, 'action');
  }

  async populateVerticesCrossReferences(schemaClasses, vertices, submitter, thingOrAction) {
    const withId = vertex => (!!vertex.uuid);
    let verticesWithRefs = vertices.filter(withId);
    let newReferences = [];
    schemaClasses.forEach((schemaClass) => {
      log.noBreak(`Populating all cross-refs on vertices of class ${schemaClass.class}...`);
      const result = randomlyFillCrossReferences(
        verticesWithRefs, schemaClass, thingOrAction, this.options,
      );
      this.debug('result for one vertex after cross-ref population', result);
      verticesWithRefs = result.vertices;
      newReferences = [...newReferences, ...result.newReferences];
      log.green(' done');
    });
    this.debug('new references to be submitted', newReferences);
    await submitter(newReferences);
    return verticesWithRefs;
  }

  populateThingVerticesCrossReferences(schemaClasses, vertices) {
    return this.populateVerticesCrossReferences(
      schemaClasses, vertices, this.submitter.thingVerticesReferences, 'Thing',
    );
  }

  populateActionVerticesCrossReferences(schemaClasses, vertices) {
    return this.populateVerticesCrossReferences(
      schemaClasses, vertices, this.submitter.actionVerticesReferences, 'Action',
    );
  }

  async run() {
    await this.init();
    const thingClasses = await this.createThingClasses();
    const actionClasses = await this.createActionClasses();
    const thingVertices = await this.createThingVertices(thingClasses);
    const actionVertices = await this.createActionVertices(actionClasses);
    const thingClassesWithRefs = await this.addCrossReferencesToThingClasses(thingClasses);
    const actionClassesWithRefs = await this.addCrossReferencesToActionClasses(actionClasses);
    await this.populateThingVerticesCrossReferences(thingClassesWithRefs, thingVertices);
    await this.populateActionVerticesCrossReferences(actionClassesWithRefs, actionVertices);
    this.submitter.printBenchmark();
  }
}

new Verifier().run();
