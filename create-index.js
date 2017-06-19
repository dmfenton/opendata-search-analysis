const client = require('./client');

client.indices.putMapping(
  {
    index: 'searches',
    type: 'search',
    body: {
      properties: {
        query: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword'
            }
          }
        },
        goal1: {
          type: 'integer'
        },
        goal4: {
          type: 'integer'
        },
        count: {
          type: 'integer'
        },
        depth: {
          type: 'integer'
        },
        avgDepth: {
          type: 'double'
        },
        pctRefinements: {
          type: 'double'
        },
        timeAfter: {
          type: 'integer'
        },
        timeAfterDup: {
          type: 'integer'
        },
        exits: {
          type: 'integer'
        },
        parsedLocation: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword'
            }
          }
        },
        parsedType: {
          type: 'keyword'
        },
        parsedDuration: {
          type: 'keyword'
        },
        parsedTags: {
          type: 'keyword'
        }
      }
    }
  },
  (e, r) => {
    console.log(e, r);
  }
);
