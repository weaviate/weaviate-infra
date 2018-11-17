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
  console.log('Ontology Creation: %d successfull creations, %d failed creations', success, failed);
}

module.exports = {
  thingClasses,
};
