// @flow

import type { GlobalOptions } from './options';

const Swagger = require('swagger-client');

module.exports = (options: GlobalOptions) => {
  const insertTokenRequestInterceptor = (req) => {
    req.headers['X-API-KEY'] = options.authorization.apiKey;
    req.headers['X-API-TOKEN'] = options.authorization.apiToken;
    req.url = req.url.replace(/^https/, 'http');

    return req;
  };

  return Swagger({
    url: `${options.serviceDiscovery.weaviateOrigin}/swagger.json`,
    requestInterceptor: insertTokenRequestInterceptor,
  });
};
