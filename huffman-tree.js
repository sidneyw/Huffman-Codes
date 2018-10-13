const leftPad = require('left-pad');
const rightPad = require('right-pad');
const PriorityQueue = require('js-priority-queue');

const binaryToNumber = binary => parseInt(binary, 2);
const numberToByte = number => leftPad((number >>> 0).toString(2), 8, '0');

class HuffNode {
  constructor(character, value = 0, left = null, right = null) {
    this.char = character;
    this.value = value;
    this.left = left;
    this.right = right;
  }

  // recursive algorithm to walk the tree and retrieve the code for each character
  getCodes(prefix, table) {
    if (this.char) {
      table[this.char] = prefix;
    } else {
      if (this.left) this.left.getCodes(`${prefix}0`, table);
      if (this.right) this.right.getCodes(`${prefix}1`, table);
    }
  }
}

class HuffmanTree {
  constructor(freqTable) {
    this.buildTree = this.buildTree.bind(this);
    this.getCodes = this.getCodes.bind(this);
    this.root = this.buildTree(freqTable);
  }

  createMinQueue(freqTable) {
    // create the initial nodes that contain characters and their frequencies
    // these are essentially the leaf nodes of the huffman tree
    const huffmanNodes = Object.entries(freqTable).map(([key, val]) => new HuffNode(key, val));
    return new PriorityQueue({
      comparator: function(a, b) {
        // a and b are type HuffNode
        return a.value - b.value;
      },
      initialValues: huffmanNodes
    });
  }

  buildTree(freqTable) {
    const minQueue = this.createMinQueue(freqTable);
    while (minQueue.length > 1) {
      const leftChild = minQueue.dequeue();
      const rightChild = minQueue.dequeue();
      const sumValue = leftChild.value + rightChild.value;
      const internalNode = new HuffNode(null, sumValue, leftChild, rightChild);
      minQueue.queue(internalNode);
    }

    return minQueue.dequeue();
  }

  getCodes() {
    const translation = {};
    this.root.getCodes('', translation);
    return translation;
  }

  encode(str) {
    const charToCode = this.getCodes();
    let encodedString = '';
    let binaryString = '';

    for (let charAt of str) {
      // get the binary representation as a string
      binaryString += charToCode[charAt];
      // we only need to keep a byte around at a time
      if (binaryString.length >= 8) {
        const byteStr = binaryString.slice(0, 8);
        binaryString = binaryString.slice(8);
        const number = binaryToNumber(byteStr);
        // transform the binary to a character code from 0-255 and store the char
        encodedString += String.fromCharCode(number);
      }
    }

    // Deal with left over binary
    if (binaryString.length) {
      const byteStr = rightPad(binaryString, 8, '0');
      const number = binaryToNumber(byteStr);
      encodedString += String.fromCharCode(number);
    }

    return encodedString;
  }

  decode(str, len) {
    let decoded = '';
    let nodePointer = this.root;

    let binaryString = '';
    // build the binary string from the encoded input
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      binaryString += numberToByte(charCode);
    }

    // Walk the huffman tree
    for (let bit of binaryString) {
      // Do not walk left over bits from the right-pad in this.encode
      if (decoded.length === len) {
        break;
      }

      // Walk the tree
      if (bit === '0') {
        nodePointer = nodePointer.left;
      } else {
        nodePointer = nodePointer.right;
      }

      // We are at a leaf node
      // get the character and go back to the root
      if (nodePointer.char) {
        decoded += nodePointer.char;
        nodePointer = this.root;
      }
    }

    return decoded;
  }
}

module.exports = HuffmanTree;
