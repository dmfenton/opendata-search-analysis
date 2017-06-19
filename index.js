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
    _index: 'searches2',
    _type: 'search'
  }
};
const parseOpts = {
  delimiter: '||',
  columns
};

let i = 0;
let total = 0;
_(fs.createReadStream('./searches.csv'))
  .split(/\n/)
  .map(row => {
    let parsed;
    try {
      parsed = parse(row, parseOpts)[0];
      Object.keys(parsed).forEach(key => {
        if (key !== 'query') {
          parsed[key] = parseFloat(parsed[key]);
        }
      });
      return parsed;
    } catch (e) {
      console.log(row, e);
      return;
    }
  })
  .compact()
  .intersperse(operation)
  .batch(10000)
  .ratelimit(5, 1000)
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
    } else {
      i++;
      const indexed = p.items.length;
      total += indexed;
      console.log(`i=${i} indexed_count=${indexed} total_count=${total}`);
    }
  })
  .stopOnError(e => {
    console.trace(e);
  })
  .done(() => {
    console.log('done');
  });
