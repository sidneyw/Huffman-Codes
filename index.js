const fs = require('fs');
const compressor = require('./compressor');

const [, , cmd, fileName] = process.argv;

function help(exitCode) {
  console.log('here');
  console.log(`Usage:\nnode index [encode/decode/help] filename`);
  process.exit(exitCode);
}

if (cmd === 'help') {
  help(0);
}

const cmds = ['encode', 'decode', 'help'];
if (!cmd || !cmds.includes(cmd) || !fileName) {
  help(1);
}

const inFileStats = fs.lstatSync(fileName);
if (!inFileStats.isFile()) {
  help(1);
}

const fileData = fs.readFileSync(fileName).toString();

function printStats(outStats, inStats) {
  console.log('Original size kb:', inStats.size);
  console.log('Compressed size kb:', outStats.size);
  const percent = (outStats.size / inStats.size) * 100;
  const roundedPercent = Math.round(percent);
  console.log(`${roundedPercent}% of original size`);
}

switch (cmd) {
  case 'encode': {
    const { freqTable, encoded } = compressor.encode(fileData);

    const outFile = `${fileName}.huff`;
    const outData = `${JSON.stringify(freqTable)}\n${encoded}`;

    fs.writeFileSync(outFile, outData);
    const outFileStats = fs.lstatSync(outFile);

    printStats(outFileStats, inFileStats);
    break;
  }

  case 'decode': {
    const outData = compressor.decode(fileData);
    const outFile = `${fileName}.decoded`;
    fs.writeFileSync(outFile, outData);
    break;
  }
}
