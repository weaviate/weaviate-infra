// @flow

const fetch = require('node-fetch');
const log = require('./log');

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

function downloadContextionary(url: string): string {
  return fetch(url)
    .then(res => res.text());
}

async function initContextionary(): Promise<Array<string>> {
  const version = await getLatestContextionaryVersion();
  const downloadURL = contextionaryURL(version);
  log.noBreak('Downloading contextionary vocabulary...');
  const contextionary = await downloadContextionary(downloadURL);
  log.green(' succesfully downloaded.');
  return parseContextionary(contextionary);
}

module.exports = initContextionary;
