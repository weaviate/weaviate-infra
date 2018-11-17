// @flow

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

class Submitter {
  client: any;

  status: Array<Status>;

  constructor(client: any) {
    this.client = client;
    this.status = [];
  }

  addStatus(status: Status) {
    this.status.push(status);
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

  async thingClasses(classes: Array<any>) {
    let succeeded = 0;
    let failed = 0;

    const handleSuccess = thingClass => (res) => {
      log.green(`Successfully submitted thingClass ${thingClass.class} to weaviate (Status ${res.status})`);
      succeeded += 1;
    };

    const handleError = thingClass => (err) => {
      log.red(`Could not submit thingClass ${thingClass.class} to weaviate (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const thingClass of classes) {
    // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .schema
        .weaviate_schema_things_create({ thingClass })
        .then(handleSuccess(thingClass))
        .catch(handleError(thingClass));
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

    const handleSuccess = reference => (res) => {
      log.green(`Successfully added cross-ref on ${reference.className} to ${reference.body['@dataType'][0]} (Status ${res.status})`);
      succeeded += 1;
    };

    const handleError = reference => (err) => {
      log.red(`Could not create cross-ref on ${reference.className} to ${reference.body['@dataType'][0]} (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const reference of references) {
    // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .schema
        .weaviate_schema_things_properties_add(reference)
        .then(handleSuccess(reference))
        .catch(handleError(reference));
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

    const handleSuccess = thingVertex => (res) => {
      log.green(`Successfully submitted thingVertex of type ${thingVertex.class} to weaviate (Status ${res.status})`);
      // eslint-disable-next-line no-param-reassign
      thingVertex.uuid = res.body.thingId;
      succeeded += 1;
    };

    const handleError = thingVertex => (err) => {
      log.red(`Could not submit thingVertex of type ${thingVertex.class} to weaviate (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const thingVertex of vertices) {
      const { class: className, ...schema } = thingVertex;
      // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .things
        .weaviate_things_create({ body: { asnyc: false, thing: { '@class': className, '@context': 'some-context', schema } } })
        .then(handleSuccess(thingVertex))
        .catch(handleError(thingVertex));
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

    const handleSuccess = reference => (res) => {
      log.green(`Successfully added cross-ref from ${reference.thingId} to `
        + `${reference.body.$cref} (Status ${res.status})`);
      succeeded += 1;
    };

    const handleError = reference => (err) => {
      log.red(`Could not create cross-ref on ${reference.className} `
        + `(Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
      failed += 1;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const reference of references) {
    // eslint-disable-next-line no-await-in-loop
      await this.client
        .apis
        .things
        .weaviate_things_patch(referenceToPatchDoc(reference))
        .then(handleSuccess(reference))
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
