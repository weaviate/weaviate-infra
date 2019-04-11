// @flow

import type { GlobalOptions } from './options';

const Swagger = require('swagger-client');
const log = require('./log');

module.exports = (options: GlobalOptions) => {
  const insertTokenRequestInterceptor = (req) => {
    req.headers['X-API-KEY'] = options.authorization.apiKey;
    req.headers['X-API-TOKEN'] = options.authorization.apiToken;
    req.headers['Content-Type'] = 'application/json';
    req.url = req.url.replace(/^https/, 'http');

    return req;
  };

  return Swagger({
    url: `${options.serviceDiscovery.weaviateOrigin}/swagger.json`,
    requestInterceptor: insertTokenRequestInterceptor,
  }).catch((e) => {
    log.bold('\n\nError!');
    log.normal('\nCould not retrieve swagger JSON from weaviate:');
    log.red(`\t${e.message}\n\n`);
    process.exit(1);
  });
};
