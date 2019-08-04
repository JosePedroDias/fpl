const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const fs = require('fs');

function writeCsv(path, headers, data) {
  const csvWriter = createCsvWriter({
    path: path,
    header: headers.map((h) => ({ id: h, title: h }))
  });
  return csvWriter.writeRecords(data);
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function readCsv(path) {
  const rows = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(csvParser())
      .on('data', (row) => {
        rows.push(clone(row));
      })
      .on('end', () => {
        resolve(rows);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

module.exports = {
  readCsv,
  writeCsv
};
