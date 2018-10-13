# Huffman Codes Node

An implementation of [Huffman Codes](https://en.wikipedia.org/wiki/Huffman_coding) in Node.js

## Usage
```bash
$ yarn install
$ node index encode <filename>
$ node index decode <filename>.huff
```

I've included some sample files to compress and decompress in the	`./data`
directory.

## Testing
```bash
$ yarn run test[:watch]
```

## Special Considerations For Node.js
The main logic for the program is in `./huffman-tree.js`

The huffman algorithm encodes the input as a string of bits. The script
included takes a file as input and writes the encoded(compressed) result to a
file as well. We cannot write individual bits to a file using node. It would
also be unwise to write the sequence of 1's and 0's as characters to a file
because each number would be represented by a byte on disk which would inflate
the file size rather than compress it. We will have to use a different
representation to store the encoded sequence.

The code included takes each sequence of 8 bits (a byte) and turns it into a
decimal number. The number is then used to create an extended ascii character
(0-255) using
[String.fromCharCode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode).
When we later decode the sequence we can perform this process in reverse to
arrive at the original string of bits.

Consider a case where the first 8 bits of the encoded string was 0011 1001
1. turn 0011 1001 to a number with `parseInt` -> 57
1. turn 57 into a char with `String.fromCharCode` -> 9
1. store char 9 in the file

At the end of the sequence we make sure the left over bits become a byte by
right padding with 0's. So if we had 3 bits left over we would add 5 0's to
the end of the sequence. This will be handled accordingly when we decode.

When we decode the file we go in the opposite direction for each char (byte)
1. char to character code 9 -> 57
1. character code to binary 57 -> 111001
1. left pad until we have 8 bits -> 00111001
1. use the sequence to walk the huffman tree

Since we may have extra zeros from the right pad in the encoding we make sure
we only decode the same number of characters we had in the input originally.
Essentially we stop when we have the correct number of characters.

In order to reconstruct the same huffman tree when we decode the minified text
we store the frequency table and length of the original input. We can parse
this when we read the encoded file and then proceed with the decoding process
described above.

## File Structure
The output of the encode command is a file with two sections
1. The frequency table used to create the huffman tree written out as json in the first line
1. The output of the huffman algorithm encoded as described above

The first line is somewhat wasteful. If the input has many unique characters
the JSON representation of the frequency table can become quite large. A better
approach would be to find some way to encode the tree structure using less
characters.
