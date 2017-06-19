const client = require('./client');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const _ = require('highland');
const columns = [
  'query',
  'goal1',
  'goal4',
  'count',
  'depth',
  'avgDepth',
  'pctRefinements',
  'timeAfter',
  'timeAfterDup',
  'exits',
  'parsedLocation',
  'parsedType',
  'parsedDuration',
  'parsedTags'
];
const operation = {
  index: {
    _index: 'searches',
    _type: 'search'
  }
};
const parseOpts = {
  delimiter: '||',
  columns
};

_(fs.createReadStream('./searches.csv'))
  .split(/\n/)
  .map(row => {
    const parsed = parse(row, parseOpts)[0];
    Object.keys(parsed).forEach(key => {
      if (key !== 'query') {
        parsed[key] = parseFloat(parsed[key]);
      }
    });
    return parsed;
  })
  .intersperse(operation)
  .batch(5000)
  .ratelimit(10, 1000)
  .map(b => {
    const body = [operation, ...b].slice(0, -1);
    return _(client.bulk({ body }));
  })
  .flatten()
  .stopOnError(e => {
    console.trace(e);
  })
  .each(p => {
    if (p.errors) {
      console.log(JSON.stringify(p));
      throw new Error();
    }
  })
  .stopOnError(e => {
    console.trace(e);
  })
  .done(() => {
    console.log('done');
  });
