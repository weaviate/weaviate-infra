// @flow

import type { GlobalOptions } from './options';

const fetch = require('node-fetch');
const log = require('./log');

const checkForStatus = (desiredStatusCode: number) => (res: Response): Promise<Response> => {
  if (res.status === desiredStatusCode) {
    return Promise.resolve(res);
  }

  return Promise.reject(new Error(`wanted status code ${desiredStatusCode}, `
  + `but got ${res.status}`));
};

function parseContextionary(textBlob: string): Array<string> {
  const removeWordsWithSpecialChars = w => w.match(/^[A-Za-z]+$/);
  const parse = () => textBlob
    .split('\n')
    .map(line => line.split(' ')[0])
    .filter(removeWordsWithSpecialChars);

  log.noBreak('Reading contextionary...');
  const words = parse();
  log.green(' succesfully parsed contextionary.');

  return words;
}

function getLatestContextionaryVersion() {
  return fetch('https://contextionary.creativesoftwarefdn.org/contextionary.json')
    .then(res => res.json())
    .then(body => body.latestVersion);
}

function contextionaryURL(version: string): string {
  return `https://contextionary.creativesoftwarefdn.org/${version}/en/contextionary.vocab`;
}

function handleContextionaryDownloadError(e: Error) {
  log.red('\n\nERROR:\n\tCould not download contextionary. If you specified a version other than'
      + ` "latest", then most likely the version does not exist: ${e.message}`);
  process.exit(1);
}

function downloadContextionary(url: string): string {
  return fetch(url)
    .then(checkForStatus(200))
    .then(res => res.text())
    .catch(handleContextionaryDownloadError);
}

async function initContextionary(options: GlobalOptions): Promise<Array<string>> {
  let version;
  if (options.serviceDiscovery.contextionaryVersion === 'latest') {
    version = await getLatestContextionaryVersion();
  } else {
    version = options.serviceDiscovery.contextionaryVersion;
    log.normal(`Not using 'latest' as the contextionary version, as ${version} was`
      + ' explicitly desired');
  }

  const downloadURL = contextionaryURL(version);
  log.noBreak('Downloading contextionary vocabulary...');
  const contextionary = await downloadContextionary(downloadURL);
  log.green(' succesfully downloaded.');
  return parseContextionary(contextionary);
}

module.exports = initContextionary;
