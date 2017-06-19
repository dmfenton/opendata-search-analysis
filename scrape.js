const fs = require('fs');
const { parseIntent } = require('./searchymcsearchface');
const csv = fs.createWriteStream('./searches.csv');
const fails = fs.createWriteStream('./fails.csv');
const request = require('request').defaults({
  gzip: true,
  json: true
});
const async = require('async');
const token = 'ya29.Gl1uBEegyalEMsU_LaafeiymEAVXG6Kdm8uTqG6xRjCLJa7X7F3jIhQ52hVd2T-Ilexo2fH86BaZSEuWB5ncvh79XAbqAZEIBkrLSqY8jLHaD5aS7b88wgga7STKXxk';

const base = 'https://www.googleapis.com/analytics/v3/data/ga';
const query =
  '?ids=ga%3A105201909&start-date=2016-01-01&end-date=2017-06-19&metrics=ga%3Agoal1Starts%2Cga%3Agoal4Starts%2Cga%3AsearchUniques%2Cga%3AsearchDepth%2Cga%3AavgSearchDepth%2Cga%3ApercentSearchRefinements%2Cga%3AsearchDuration%2Cga%3AavgSearchDuration%2Cga%3AsearchExits&dimensions=ga%3AsearchKeyword&samplingLevel=Higher_Precision&max-results=100000';

const requests = [];

for (let i = 0; i < 48; i++) {
  const index = i * 10000 + 1;
  const url = `${base}${query}&access_token=${token}&start-index=${index}`;
  requests.push(url);
}

async.eachLimit(
  requests,
  5,
  function(url, callback) {
    request(url, (e, res, body) => {
      console.log(`completed iteration url=${url}`);
      body.rows.forEach(row => {
        row[0] = row[0].replace(/"/g, "'");
        let intent = {};
        try {
          intent = parseIntent(row[0]).intent;
          intent.type = intent.type === 'Web Map,Web Mapping Application,Feature Service,Map Service,Image Service,Code Sample,CityEngine Web Scene'
            ? undefined
            : intent.type;
        } catch (e) {
          intent = {};
          fails.write(row[0] + '\n');
        }

        const final = [...row, intent.location, intent.type, intent.duration, intent.tags];
        csv.write(`${final.join('||')}\n`);
      });
      callback();
    });
  },
  () => {
    fails.end();
    csv.end();
  }
);
