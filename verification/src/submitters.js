// @flow

import type { Monitoring, Hrtime } from './benchmark';

const BenchmarkReporter = require('./benchmark');
const log = require('./log');

type Status = {
  description: string,
  succeeded: number,
  failed: number,
}

function referenceToPatchDoc(reference) {
  return {
    thingId: reference.thingId,
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

  status: Array<Status>;

  monitoring: Array<Monitoring>;

  constructor(client: any) {
    this.client = client;
    this.status = [];
    this.monitoring = [];
  }

  addStatus(status: Status) {
    this.status.push(status);
  }

  addMonitoring(entry: Monitoring) {
    this.monitoring.push(entry);
  }

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
      log.green(task.succeeded);
      log.boldNoBreak('Failed: ');
      log.red(task.failed);
      log.boldNoBreak('Success Rate: ');
      log.normal(`${Math.floor(task.succeeded / (task.failed + task.succeeded) * 100)} %`);
    });
  }

  printBenchmark() {
    new BenchmarkReporter(this.monitoring).print();
  }


  async thingClasses(classes: Array<any>) {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (thingClass, start) => (res) => {
      log.green(`Successfully submitted thingClass ${thingClass.class} to weaviate (Status ${res.status})`);
      succeeded += 1;
      this.addMonitoring({
        verb: 'create',
        resource: 'schema/thing',
        success: true,
        hrtime: process.hrtime(start),
      });
    };

    const handleError = (thingClass, start) => (err) => {
      log.red(`Could not submit thingClass ${thingClass.class} to weaviate (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      this.addMonitoring({
        verb: 'create',
        resource: 'schema/thing',
        success: false,
        hrtime: process.hrtime(start),
      });
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const thingClass of classes) {
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .schema
        .weaviate_schema_things_create({ thingClass })
        .then(handleSuccess(thingClass, start))
        .catch(handleError(thingClass, start));
    }

    this.addStatus({
      description: 'Ontology Creation (creating Things without cross-references)',
      succeeded,
      failed,
    });
  }

  async actionClasses(classes: Array<any>) {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (actionClass, start) => (res) => {
      log.green(`Successfully submitted actionClass ${actionClass.class} to weaviate (Status ${res.status})`);
      succeeded += 1;
      this.addMonitoring({
        verb: 'create',
        resource: 'schema/action',
        success: true,
        hrtime: process.hrtime(start),
      });
    };

    const handleError = (actionClass, start) => (err) => {
      log.red(`Could not submit actionClass ${actionClass.class} to weaviate (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      this.addMonitoring({
        verb: 'create',
        resource: 'schema/action',
        success: false,
        hrtime: process.hrtime(start),
      });
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const actionClass of classes) {
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .schema
        .weaviate_schema_actions_create({ actionClass })
        .then(handleSuccess(actionClass, start))
        .catch(handleError(actionClass, start));
    }

    this.addStatus({
      description: 'Ontology Creation (creating Things without cross-references)',
      succeeded,
      failed,
    });
  }

  async thingClassReferences(references: Array<any>) {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (reference, start) => (res) => {
      log.green(`Successfully added cross-ref on ${reference.className} to ${reference.body['@dataType'][0]} (Status ${res.status})`);
      this.addMonitoring({
        verb: 'create',
        resource: 'schema/thing/property',
        success: true,
        hrtime: process.hrtime(start),
      });
      succeeded += 1;
    };

    const handleError = (reference, start) => (err) => {
      log.red(`Could not create cross-ref on ${reference.className} to ${reference.body['@dataType'][0]} (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      this.addMonitoring({
        verb: 'create',
        resource: 'schema/thing/property',
        success: false,
        hrtime: process.hrtime(start),
      });
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const reference of references) {
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .schema
        .weaviate_schema_things_properties_add(reference)
        .then(handleSuccess(reference, start))
        .catch(handleError(reference, start));
    }

    this.addStatus({
      description: 'Ontology Updates (create cross-references between existing Thing Classes)',
      succeeded,
      failed,
    });
  }

  async thingVertices(vertices: Array<any>) {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (thingVertex, start) => (res) => {
      log.green(`Successfully submitted thingVertex of type ${thingVertex.class} to weaviate (Status ${res.status})`);
      // eslint-disable-next-line no-param-reassign
      thingVertex.uuid = res.body.thingId;
      this.addMonitoring({
        verb: 'create',
        resource: 'thing',
        success: true,
        hrtime: process.hrtime(start),
      });
      succeeded += 1;
    };

    const handleError = (thingVertex, start) => (err) => {
      log.red(`Could not submit thingVertex of type ${thingVertex.class} to weaviate (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      this.addMonitoring({
        verb: 'create',
        resource: 'thing',
        success: false,
        hrtime: process.hrtime(start),
      });
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const thingVertex of vertices) {
      const { class: className, ...schema } = thingVertex;
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .things
        .weaviate_things_create({ body: { asnyc: false, thing: { '@class': className, '@context': 'some-context', schema } } })
        .then(handleSuccess(thingVertex, start))
        .catch(handleError(thingVertex, start));
    }

    this.addStatus({
      description: 'Create Thing Vertices (vertices of various thingClasses with only primitive properties)',
      succeeded,
      failed,
    });
    return vertices;
  }


  async thingVerticesReferences(references: Array<any>) {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = (reference, start) => (res) => {
      const elapsed = process.hrtime(start);
      this.addMonitoring({
        verb: 'patch (add cross-ref)',
        resource: 'thing',
        success: true,
        hrtime: process.hrtime(start),
      });
      log.green(`Successfully added cross-ref from ${reference.thingId} to `
        + `${reference.body.$cref} (Status ${res.status}), took ${formatElapsed(elapsed)}`);
      succeeded += 1;
    };

    const handleError = (reference, start) => (err) => {
      this.addMonitoring({
        verb: 'patch (add cross-ref)',
        resource: 'thing',
        success: false,
        hrtime: process.hrtime(start),
      });
      log.red(`Could not create cross-ref on ${reference.className} `
        + `(Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const reference of references) {
      const start = process.hrtime();
      // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .things
        .weaviate_things_patch(referenceToPatchDoc(reference))
        .then(handleSuccess(reference, start))
        .catch(handleError(reference));
    }

    this.addStatus({
      description: 'Update Thing Vertices (fill cross-references to other Things)',
      succeeded,
      failed,
    });
  }
}


module.exports = Submitter;
