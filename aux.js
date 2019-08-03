const fs = require('fs');
const csv = require('csv-parser');
const http = require('http');
const https = require('https');
const util = require('util');
const child_process = require('child_process');
const readline = require('readline');

function get(url) {
  const prot = url.indexOf('https:') === 0 ? https : http;
  return new Promise((resolve, reject) => {
    prot.get(url, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(data);
      });

      resp.on('error', reject);
    });
  });
}

// given a CSV file, returns an array of row objects
function readCsv(fn) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(fn)
      .pipe(csv())
      .on('error', reject)
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      });
  });
}

function jsonToStringIndented(o) {
  return JSON.stringify(o, null, 2);
}

function writeText(fn, txt) {
  fs.writeFileSync(fn, txt);
}

function writeJson(fn, o) {
  writeText(fn, jsonToStringIndented(o));
}

function readText(fn) {
  return fs.readFileSync(fn).toString();
}

function readJson(fn) {
  return JSON.parse(readText(fn));
}

// times(3) returns [0, 1, 2]
function times(n) {
  return new Array(n).fill(true).map((_, i) => i);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// returns a random element of the given array
function randomInArr(arr) {
  const i = ~~(Math.random() * arr.length);
  return arr[i];
}

// functional version of max in array
function max(arr) {
  return Math.max(...arr);
}

// [ 'a', 'b', 'a', 'a' ] returns {a:3. b:1}
function histogram(arr) {
  const h = {};
  arr.forEach((v) => {
    if (!(v in h)) {
      h[v] = 1;
    } else {
      h[v] += 1;
    }
  });
  return h;
}

// {a: '2', b: '2.3', c:'z'} returns {a: 2, b: 2.3, c:'z'}
function valuesToFloats(o) {
  const O = {};
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v !== '' && isFinite(v)) {
      O[k] = parseFloat(v);
    } else {
      O[k] = v;
    }
  }
  return O;
}

// {a:true, d:2, c:'z'} returns [true, 2, 'z']
function toValues(o) {
  return Object.values(o);
}

function zeroPad(s, n) {
  s = '' + s;
  const l = s.length;
  if (l < n) {
    return new Array(n - l + 1).join('0') + s;
  }
  return s.substring(l - n);
}

// 'stuff', 8 -> 'stuff   '; 'hugething', 8 -> 'hugethin'
function toPad(s, n) {
  s = '' + s;
  const l = s.length;
  if (l < n) {
    return s + new Array(n - l + 1).join(' ');
  }
  return s.substring(0, n);
}

function sign(n) {
  return n < 0 ? -1 : n > 0 ? 1 : 0;
}

function sortNum(arr, criteria) {
  arr.sort((a, b) => sign(a[criteria] - b[criteria]));
  return arr;
}

function sortAlpha(arr, criteria) {
  arr.sort((a_, b_) => {
    const a = a_[criteria];
    const b = b_[criteria];
    return a < b ? -1 : a > b ? 1 : 0;
  });
  return arr;
}

function listFilesByCreationTime(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        return reject(err);
      }
      const sortedFiles = files
        .map((fn) => ({
          name: fn,
          time: fs.statSync(dir + '/' + fn).mtime.getTime()
        }))
        .sort((a, b) => a.time - b.time)
        .map((v) => v.name);
      resolve(sortedFiles);
    });
  });
}

function ask(question) {
  return new Promise((resolve, reject) => {
    const r = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    r.question(question + '\n', (answer) => {
      r.close();
      resolve(answer);
    });
    r.on('error', reject);
  });
}

const exec = util.promisify(child_process.exec);

function resolveAnyPromise(pr) {
  return new Promise((resolve) => {
    pr.then(resolve, resolve);
  });
}

function execRobust(cmd) {
  return resolveAnyPromise(exec(cmd));
}

module.exports = {
  get,
  exec,
  execRobust,
  ask,
  readCsv,
  jsonToStringIndented,
  writeJson,
  readJson,
  writeText,
  readText,
  times,
  sleep,
  randomInArr,
  max,
  histogram,
  valuesToFloats,
  toValues,
  zeroPad,
  toPad,
  sortNum,
  sortAlpha,
  listFilesByCreationTime
};
