// @flow

import type { Monitoring, Hrtime } from './benchmark';

const BenchmarkReporter = require('./benchmark');
const Comparer = require('./comparer');
const log = require('./log');

type Status = {
  description: string,
  succeeded: number,
  failed: number,
};

function referenceToPatchDoc(reference, thingOrAction) {
  return {
    id: reference.uuid,
    body: [
      {
        op: 'add',
        path: `/schema/${reference.propertyName}`,
        value: reference.body,
      },
    ],
  };
}

function formatElapsed(elapsed: Hrtime): string {
  return `${Math.floor(elapsed[0] * 1000 + elapsed[1] / 1000000)}ms`;
}

class Submitter {
  client: any;

  comparer: Comparer;

  status: Array<Status>;

  monitoring: Array<Monitoring>;

  queue: Object;

  constructor(client: any) {
    this.client = client;
    this.status = [];
    this.monitoring = [];
    this.comparer = new Comparer(this.addMonitoring);
    this.queue = {
      thing: [],
      action: [],
    };
  }

  addStatus(status: Status) {
    this.status.push(status);
  }

  addMonitoring = (entry: Monitoring) => {
    this.monitoring.push(entry);
  };

  printStatus() {
    log.bold('------------------------------------');
    log.bold('Stats (Summary)');
    log.bold('------------------------------------');

    this.status.forEach((task) => {
      log.normal('');
      log.boldNoBreak('Task: ');
      log.normal(task.description);
      log.bold('------------');
      log.boldNoBreak('Success: ');
      log.green(`${task.succeeded}`);
      log.boldNoBreak('Failed: ');
      log.red(`${task.failed}`);
      log.boldNoBreak('Success Rate: ');
      log.normal(
        `${Math.floor(
          (task.succeeded / (task.failed + task.succeeded)) * 100,
        )} %`,
      );
    });
  }

  printBenchmark() {
    new BenchmarkReporter(this.monitoring).print();
  }

  classes = (thingOrAction: string) => async (classes: Array<any>) => {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (schemaClass, start) => (res) => {
      log.green(
        `Successfully submitted ${thingOrAction} class ${
          schemaClass.class
        } to weaviate (Status ${res.status})`,
      );
      succeeded += 1;
      this.addMonitoring({
        verb: 'create',
        resource: `schema/${thingOrAction}`,
        success: true,
        hrtime: process.hrtime(start),
      });
    };

    const handleError = (schemaClass, start) => (err) => {
      log.red(
        `Could not submit ${thingOrAction} class ${
          schemaClass.class
        } to weaviate (Status ${err.response.status}): ${JSON.stringify(
          err.response.body,
        )}`,
      );
      this.addMonitoring({
        verb: 'create',
        resource: `schema/${thingOrAction}`,
        success: false,
        hrtime: process.hrtime(start),
      });
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const schemaClass of classes) {
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client.apis.schema[`schema_${thingOrAction}s_create`]({
        [`${thingOrAction}Class`]: schemaClass,
      })
        .then(handleSuccess(schemaClass, start))
        .catch(handleError(schemaClass, start));
    }

    this.addStatus({
      description: `Ontology Creation (creating ${thingOrAction}s without cross-references)`,
      succeeded,
      failed,
    });
  };

  thingClasses = this.classes('thing');

  actionClasses = this.classes('action');

  classReferences = (thingOrAction: string) => async (
    references: Array<any>,
  ) => {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (reference, start) => (res) => {
      log.green(
        `Successfully added cross-ref on ${reference.className} to ${
          reference.body.dataType[0]
        } (Status ${res.status})`,
      );
      this.addMonitoring({
        verb: 'create',
        resource: `schema/${thingOrAction}/property`,
        success: true,
        hrtime: process.hrtime(start),
      });
      succeeded += 1;
    };

    const handleError = (reference, start) => (err) => {
      log.red(
        `Could not create cross-ref on ${reference.className} to ${
          reference.body.dataType[0]
        } (Status ${err.response.status}): ${JSON.stringify(
          err.response.body,
        )}`,
      );
      this.addMonitoring({
        verb: 'create',
        resource: `schema/${thingOrAction}/property`,
        success: false,
        hrtime: process.hrtime(start),
      });
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const reference of references) {
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client.apis.schema[`schema_${thingOrAction}s_properties_add`](
        reference,
      )
        .then(handleSuccess(reference, start))
        .catch(handleError(reference, start));
    }

    this.addStatus({
      description: `Ontology Updates (create cross-references between existing ${thingOrAction} classes)`,
      succeeded,
      failed,
    });
  };

  thingClassReferences = this.classReferences('thing');

  actionClassReferences = this.classReferences('action');

  vertices = (thingOrAction: string) => async (vertices: Array<any>) => {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (vertex, start) => (res) => {
      log.green(
        `Successfully submitted ${thingOrAction} vertex of type ${
          vertex.class
        } to weaviate (Status ${res.status})`,
      );
      // eslint-disable-next-line no-param-reassign
      vertex.uuid = res.body.id;
      this.addMonitoring({
        verb: 'create',
        resource: thingOrAction,
        success: true,
        hrtime: process.hrtime(start),
      });
      succeeded += 1;
    };

    const handleError = (vertex, start) => (err) => {
      log.red(err);
      log.red(
        `Could not submit ${thingOrAction} vertex of type ${
          vertex.class
        } to weaviate (Status ${err.response.status}): ${JSON.stringify(
          err.response.body,
        )}`,
      );
      this.addMonitoring({
        verb: 'create',
        resource: 'action',
        success: false,
        hrtime: process.hrtime(start),
      });
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const vertex of vertices) {
      const { class: className, ...schema } = vertex;
      if (this.queue[thingOrAction].length >= 50) {
        // actually submit now
        const start = process.hrtime();
        // eslint-disable-next-line no-await-in-loop
        await this.client.apis.batching[`batching_${thingOrAction}s_create`]({
          body: {
            [`${thingOrAction}s`]: this.queue[thingOrAction],
          },
        })
          .then(handleSuccess(vertex, start))
          .catch(handleError(vertex, start));
        this.queue[thingOrAction] = [];
      } else {
        // only append for later submission
        this.queue[thingOrAction].push({ class: className, schema });
      }
    }

    this.addStatus({
      description: `Create ${thingOrAction} vertices (vertices of various actionClasses with only primitive properties)`,
      succeeded,
      failed,
    });
    return vertices;
  };

  actionVertices = this.vertices('action');

  thingVertices = this.vertices('thing');

  verticesReferences = (thingOrAction: string) => async (
    references: Array<any>,
  ) => {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (reference, start) => (res) => {
      const elapsed = process.hrtime(start);
      this.addMonitoring({
        verb: 'patch (add cross-ref)',
        resource: thingOrAction,
        success: true,
        hrtime: process.hrtime(start),
      });
      log.green(
        `Successfully added cross-ref from ${reference.uuid} to `
          + `${reference.body.$cref} (Status ${res.status}), took ${formatElapsed(
            elapsed,
          )}`,
      );
      succeeded += 1;
    };

    const handleError = (reference, start) => (err) => {
      this.addMonitoring({
        verb: 'patch (add cross-ref)',
        resource: thingOrAction,
        success: false,
        hrtime: process.hrtime(start),
      });
      log.red(
        `Could not create cross-ref on ${reference.className} `
          + `(Status ${err.response.status}): ${JSON.stringify(
            err.response.body,
          )}`,
      );
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const reference of references) {
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client.apis[`${thingOrAction}s`]
        [`${thingOrAction}s_patch`](
          referenceToPatchDoc(reference, thingOrAction),
        )
        .then(handleSuccess(reference, start))
        .catch(handleError(reference));
    }

    this.addStatus({
      description: `Update ${thingOrAction} vertices (fill cross-references to other ${thingOrAction}s)`,
      succeeded,
      failed,
    });
  };

  thingVerticesReferences = this.verticesReferences('thing');

  actionVerticesReferences = this.verticesReferences('action');

  getAndCheckVertices = (thingOrAction: string) => async (
    vertices: Array<any>,
  ) => {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (vertex, start) => (res) => {
      this.addMonitoring({
        verb: 'get',
        resource: thingOrAction,
        success: true,
        hrtime: process.hrtime(start),
      });
      log.green(
        `Successfully retrieved ${thingOrAction} vertex with uuid ${
          vertex.uuid
        } ` + `(Status: ${res.status})`,
      );
      succeeded += 1;

      this.comparer.retrievedWithCached(res.body, vertex, thingOrAction);
    };

    const handleError = (vertex, start) => (err) => {
      this.addMonitoring({
        verb: 'get',
        resource: thingOrAction,
        success: false,
        hrtime: process.hrtime(start),
      });
      log.red(
        `Could not retrieve ${thingOrAction} with uuid ${vertex.uuid} `
          + `(Status ${err.response.status}): ${JSON.stringify(
            err.response.body,
          )}`,
      );
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const vertex of vertices) {
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client.apis[`${thingOrAction}s`]
        [`${thingOrAction}s_get`]({
          id: vertex.uuid,
        })
        .then(handleSuccess(vertex, start))
        .catch(handleError(vertex));
    }

    this.addStatus({
      description: `Get ${thingOrAction} vertices`,
      succeeded,
      failed,
    });
  };

  getAndCheckThingVertices = this.getAndCheckVertices('thing');

  getAndCheckActionVertices = this.getAndCheckVertices('action');
}

module.exports = Submitter;
