import { openSync, gets } from 'fs';

export function* lineIterator(fd) {
  let s;
  if(typeof fd == 'string') fd = openSync(fd, 'r');
  while((s = gets(fd))) yield s;
}

export class DiffFile {
  constructor(file) {
    this.fd = lineIterator(file);
  }
}


export const readDiff = (input) => {
  if (!input) return [];
  if (typeof input !== "string" || input.match(/^\s+$/)) return [];

  const lines = input.split("\n");
  if (lines.length === 0) return [];

  const files = [];
  let currentFile = null;
  let currentChunk = null;
  let deletedLineCounter = 0;
  let addedLineCounter = 0;
  let currentFileChanges = null;

  const normal = (line) => {
    currentChunk?.changes.push({
      type: "normal",
      normal: true,
      ln1: deletedLineCounter++,
      ln2: addedLineCounter++,
      content: line,
    });
    currentFileChanges.oldLines--;
    currentFileChanges.newLines--;
  };

  const start = (line) => {
    const [fromFileName, toFileName] = parseFiles(line) ?? [];

    currentFile = {
      chunks: [],
      deletions: 0,
      additions: 0,
      from: fromFileName,
      to: toFileName,
    };

    files.push(currentFile);
  };

  const restart = () => {
    if (!currentFile || currentFile.chunks.length) start();
  };

  const newFile = (_, match) => {
    restart();
    currentFile.new = true;
    currentFile.newMode = match[1];
    currentFile.from = "/dev/null";
  };

  const deletedFile = (_, match) => {
    restart();
    currentFile.deleted = true;
    currentFile.oldMode = match[1];
    currentFile.to = "/dev/null";
  };

  const oldMode = (_, match) => {
    restart();
    currentFile.oldMode = match[1];
  };

  const newMode = (_, match) => {
    restart();
    currentFile.newMode = match[1];
  };

  const index = (line, match) => {
    restart();
    currentFile.index = line.split(" ").slice(1);
    if (match[1]) {
      currentFile.oldMode = currentFile.newMode = match[1].trim();
    }
  };

  const fromFile = (line) => {
    restart();
    currentFile.from = parseOldOrNewFile(line);
  };

  const toFile = (line) => {
    restart();
    currentFile.to = parseOldOrNewFile(line);
  };

  const toNumOfLines = (number) => +(number || 1);

  const chunk = (line, match) => {
    if (!currentFile) {
      start(line);
    }

    const [oldStart, oldNumLines, newStart, newNumLines] = match.slice(1);

    deletedLineCounter = +oldStart;
    addedLineCounter = +newStart;
    currentChunk = {
      content: line,
      changes: [],
      oldStart: +oldStart,
      oldLines: toNumOfLines(oldNumLines),
      newStart: +newStart,
      newLines: toNumOfLines(newNumLines),
    };
    currentFileChanges = {
      oldLines: toNumOfLines(oldNumLines),
      newLines: toNumOfLines(newNumLines),
    };
    currentFile.chunks.push(currentChunk);
  };

  const del = (line) => {
    if (!currentChunk) return;

    currentChunk.changes.push({
      type: "del",
      del: true,
      ln: deletedLineCounter++,
      content: line,
    });
    currentFile.deletions++;
    currentFileChanges.oldLines--;
  };

  const add = (line) => {
    if (!currentChunk) return;

    currentChunk.changes.push({
      type: "add",
      add: true,
      ln: addedLineCounter++,
      content: line,
    });
    currentFile.additions++;
    currentFileChanges.newLines--;
  };

  const eof = (line) => {
    if (!currentChunk) return;

    const [mostRecentChange] = currentChunk.changes.slice(-1);

    currentChunk.changes.push({
      type: mostRecentChange.type,
      [mostRecentChange.type]: true,
      ln1: mostRecentChange.ln1,
      ln2: mostRecentChange.ln2,
      ln: mostRecentChange.ln,
      content: line,
    });
  };

  const schemaHeaders = [
    [/^diff\s/, start],
    [/^new file mode (\d+)$/, newFile],
    [/^deleted file mode (\d+)$/, deletedFile],
    [/^old mode (\d+)$/, oldMode],
    [/^new mode (\d+)$/, newMode],
    [/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/, index],
    [/^---\s/, fromFile],
    [/^\+\+\+\s/, toFile],
    [/^@@\s+-(\d+),?(\d+)?\s+\+(\d+),?(\d+)?\s@@/, chunk],
    [/^\\ No newline at end of file$/, eof],
  ];

  const schemaContent = [
    [/^\\ No newline at end of file$/, eof],
    [/^-/, del],
    [/^\+/, add],
    [/^\s+/, normal],
  ];

  const parseContentLine = (line) => {
    for (const [pattern, handler] of schemaContent) {
      const match = line.match(pattern);
      if (match) {
        handler(line, match);
        break;
      }
    }
    if (
      currentFileChanges.oldLines === 0 &&
      currentFileChanges.newLines === 0
    ) {
      currentFileChanges = null;
    }
  };

  const parseHeaderLine = (line) => {
    for (const [pattern, handler] of schemaHeaders) {
      const match = line.match(pattern);
      if (match) {
        handler(line, match);
        break;
      }
    }
  };

  const parseLine = (line) => {
    if (currentFileChanges) {
      parseContentLine(line);
    } else {
      parseHeaderLine(line);
    }
    return;
  };

  for (const line of lines) parseLine(line);

  return files;
};
