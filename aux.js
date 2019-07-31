const fs = require('fs');
const csv = require('csv-parser');

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

module.exports = {
  readCsv,
  times,
  sleep,
  randomInArr,
  max,
  histogram,
  valuesToFloats,
  toValues,
  toPad,
  sortNum,
  sortAlpha
};
