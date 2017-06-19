const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: 'http://elastic.koopernetes.com'
});

module.exports = client;
