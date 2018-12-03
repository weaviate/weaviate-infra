// @flow

import type { Monitoring } from './benchmark';

const deepEqual = require('deep-equal');
const log = require('./log');

type Vertex = {
  ['@class']: string,
  schema: Object,
}

function compareClass(retrieved: Vertex, cached: any) {
  if (retrieved['@class'] !== cached.class) {
    throw new Error(`classes don't match: ${retrieved['@class']} vs ${cached.class}`);
  }
}

function compareSchema(retrieved: Vertex, cached: any) {
  const { uuid: _, class: __, ...cachedSchema } = cached;
  const cachedSchemaString = JSON.stringify(cachedSchema, null, 2);
  const actualSchemaString = JSON.stringify(retrieved.schema, null, 2);
  if (!deepEqual(retrieved.schema, cachedSchema)) {
    throw new Error(`schema doesn't match: received: ${actualSchemaString} vs sent: ${cachedSchemaString}`);
  }
}

type AddMonitoring = (entry: Monitoring) => void

class Comparer {
  addMonitoring: AddMonitoring

  constructor(addMonitoring: AddMonitoring) {
    this.addMonitoring = addMonitoring;
  }

  monitorSuccess(thingOrAction: string, success: boolean) {
    this.addMonitoring({
      verb: 'round-robin check',
      resource: `${thingOrAction}`,
      success,
      hrtime: [0, 0],
    });
  }

  retrievedWithCached(retrieved: Vertex, cached: any, thingOrAction: string) {
    try {
      compareClass(retrieved, cached);
      compareSchema(retrieved, cached);
      log.green(`Perfect match on ${cached.uuid}!`);
      this.monitorSuccess(thingOrAction, true);
    } catch (e) {
      log.red(`No match on ${cached.uuid}: ${e.message}`);
      this.monitorSuccess(thingOrAction, false);
    }
  }
}

module.exports = Comparer;
