async function thingClasses(client, classes, writeGreen, writeRed) {
  let success = 0;
  let failed = 0;

  const handleSuccess = thingClass => (res) => {
    writeGreen(`Successfully submitted thingClass ${thingClass.class} to weaviate (Status ${res.status})`);
    success += 1;
  };

  const handleError = thingClass => (err) => {
    writeRed(`Could not submit thingClass ${thingClass.class} to weaviate (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
    failed += 1;
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const thingClass of classes) {
    // eslint-disable-next-line no-await-in-loop
    await client
      .apis
      .schema
      .weaviate_schema_things_create({ thingClass })
      .then(handleSuccess(thingClass))
      .catch(handleError(thingClass));
  }

  // eslint-disable-next-line no-console
  console.log('Ontology Creation: %d successful creations, %d failed creations', success, failed);
}

async function thingClassReferences(client, references, writeGreen, writeRed) {
  let success = 0;
  let failed = 0;

  const handleSuccess = reference => (res) => {
    writeGreen(`Successfully added cross-ref on ${reference.className} to ${reference.body['@dataType'][0]} (Status ${res.status})`);
    success += 1;
  };

  const handleError = reference => (err) => {
    writeRed(`Could not create cross-ref on ${reference.className} to ${reference.body['@dataType'][0]} (Status ${err.response.status}): ${JSON.stringify(err.response.body)}`);
    failed += 1;
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const reference of references) {
    // eslint-disable-next-line no-await-in-loop
    await client
      .apis
      .schema
      .weaviate_schema_things_properties_add(reference)
      .then(handleSuccess(reference))
      .catch(handleError(reference));
  }

  // eslint-disable-next-line no-console
  console.log('Cross-Reference creation: %d successful creations, %d failed creations', success, failed);
}

module.exports = {
  thingClasses,
  thingClassReferences,
};
