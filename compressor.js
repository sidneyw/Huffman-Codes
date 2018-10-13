const HuffmanTree = require('./huffman-tree');

function calculateFreqTable(string) {
  const table = {};
  for (let charAt of string) {
    table[charAt] ? table[charAt]++ : (table[charAt] = 1);
  }

  return table;
}

function encode(fileData) {
  const freqTable = calculateFreqTable(fileData);
  const huffman = new HuffmanTree(freqTable);

  const encoded = huffman.encode(fileData);
  freqTable.len = fileData.length;

  return { freqTable, encoded };
}

function decode(fileData) {
  const [freqJsonStr, ...restOfFile] = fileData.split('\n');
  const encodedString = restOfFile.join('\n');
  const freqTable = JSON.parse(freqJsonStr);
  const { len } = freqTable;
  delete freqTable['len'];

  const huffman = new HuffmanTree(freqTable);

  return huffman.decode(encodedString, len);
}

module.exports = { calculateFreqTable, encode, decode };
