// Copyright (C) 2017 Doug Ilijev
// Licensed under the MIT License

'use strict';
const fs = require('fs');
const ArgumentParser = require('argparse').ArgumentParser;

const parser = new ArgumentParser({
    description: "Argparse description"
});

parser.addArgument(['--bpt'], { required: false, help: "Brown Paper Tickets CSV File" });
parser.addArgument(['--gs'], { required: false, help: "GoldStar CSV File" });
parser.addArgument(['--groupon'], { required: false, help: "GoldStar CSV File" });
parser.addArgument(['--bpt-season'], { required: false, help: "Brown Paper Tickets Season Passes CSV File" });
parser.addArgument(['--extra'], { required: false, help: "Extra entries such as reserved tickets" });
parser.addArgument(['--out'], { required: false, help: "Output File" });

const args = parser.parseArgs();

const bptFile = args['bpt'];
const bptSeasonFile = args['bpt_season'];
const gsFile = args['gs'];
const grouponFile = args['groupon'];
const extraFile = args['extra'];
const outFile = args['out'] || 'list.csv'; // default value

let bptFileData;
if (bptFile) {
    console.log(`Reading BPT File: ${bptFile}`);
    bptFileData = fs.readFileSync(bptFile, 'utf8');
} else {
    console.log("INFO: No BPT File");
}

let gsFileData;
if (gsFile) {
    console.log(`Reading GoldStar File: ${gsFile}`);
    gsFileData = fs.readFileSync(gsFile, 'utf8');
} else {
    console.log("INFO: No GoldStar File");
}

let grouponFileData;
if (grouponFile) {
    console.log(`Reading Groupon File: ${grouponFile}`);
    grouponFileData = fs.readFileSync(grouponFile, 'utf8');
} else {
    console.log("INFO: No Groupon File");
}

let bptSeasonFileData;
if (bptSeasonFile) {
    console.log(`Reading BPT Season File: ${bptSeasonFile}`);
    bptSeasonFileData = fs.readFileSync(bptSeasonFile, 'utf8');
} else {
    console.log("INFO: No BPT Season File");
}

let extraFileData;
if (extraFile) {
    console.log(`Reading Extra File: ${extraFile}`);
    extraFileData = fs.readFileSync(extraFile, 'utf8');
} else {
    console.log("INFO: No Extra File");
}

console.log(`Output file: ${outFile}`);

class Row {
    constructor(last, first, qty, source, ticket) {
        this.last = last;
        this.first = first;
        this.qty = qty;
        this.source = source;
        this.tickets = [ticket];
    }

    mergeRow(other) {
        if (this.last === other.last &&
            this.first === other.first) {
            this.qty += other.qty;
            this.tickets = this.tickets.concat(other.tickets);
            return true;
        } else {
            return false;
        }
    }

    getPrefixRange() {
        // verify all are integers
        let numbers = [];
        for (let x of this.tickets) {
            const parsed = parseInt(x)
            if (!Number.isNaN(parsed)) {
                numbers.push(parsed);
            } else {
                // cannot create prefix range for non-integers
                return undefined;
            }
        }

        numbers = numbers.sort();
        if (numbers.length === 1) {
            return numbers[0];
        }

        // verify ascending order
        for (let i = 1; i < numbers.length; ++i) {
            if (numbers[i - 1] !== numbers[i] - 1) {
                return undefined;
            }
        }

        // choose a prefix
        const first = "" + numbers[0];
        const last = "" + numbers.slice(-1)[0];

        let index = 0;
        for (; index < first.length; ++index) {
            const firstPart = first.slice(0, index);
            const lastPart = last.slice(0, index);
            if (firstPart !== lastPart) {
                break;
            }
        }

        const prefixRange = first + ".." + last.slice(index - 1);
        return prefixRange;
    }

    getTicketsString() {
        let out = this.getPrefixRange();
        if (out === undefined) {
            // TODO make this more useful for multiple non-numeric tickets
            if (this.tickets.length > 1) {
                out = this.tickets[0] + ",...";
            } else {
                out = this.tickets[0];
            }
            // out = "";
            // for (let i in this.tickets) {
            //     out += this.tickets[i];
            //     if (i < this.tickets.length - 1) {
            //         out += ",";
            //     }
            // }
        }
        return out;
    }

    toString() {
        return `"${this.last}","${this.first}",${this.qty},"${this.source}","${this.getTicketsString()}"`;
    }
}

function isBptTicketRow(line) {
    const fields = line.split(/,/g);
    const val = parseInt(fields[0]);
    return !Number.isNaN(val);
}

function isGoldStarTicketRow(line) {
    const fields = line.split(/,/g);
    const val = parseInt(fields[3]);
    return !Number.isNaN(val);
}

function isGrouponTicketRow(line) {
    return /^LG/.test(line);
}

function isExtraTicketRow(line) {
    return /,/.test(line);
}

function createBptRow(line, source) {
    const fields = line.split(/,/g);
    const last = fields[1];
    const first = fields[2];
    const qty = 1;
    const ticket = fields[0];
    return new Row(last, first, qty, source, ticket);
}

function createGoldStarRow(line) {
    const fields = line.split(/,/g);
    const last = fields[1];
    const first = fields[2];
    const qty = parseInt(fields[3]);
    const source = "GoldStar";
    const ticket = fields[7];
    return new Row(last, first, qty, source, ticket);
}

function createGrouponRow(line) {
    const fields = line.split(/,/g);
    const name = fields[1];
    const nameParts = name.split(/ /g);
    const last = nameParts[nameParts.length - 1];
    const first = nameParts.slice(0, nameParts.length - 1).join(' ');
    const qty = 1;
    const source = "Groupon";
    const ticket = fields[0];
    return new Row(last, first, qty, source, ticket);
}

function createExtraRow(line) {
    const fields = line.split(/,/g);
    fields[3] = "(Reserved)";
    return new Row(...fields);
}

function readData(test, create, data, source) {
    const lines = data.split(/\r?\n/g);
    const rows = [];
    for (let line of lines) {
        if (test(line)) {
            const row = create(line, source);
            rows.push(row);
        }
    }
    return rows;
}

function readBptData(data, source = "BPT") {
    return data && readData(isBptTicketRow, createBptRow, data, source);
}

function readGoldStarData(data) {
    return data && readData(isGoldStarTicketRow, createGoldStarRow, data);
}

function readGrouponData(data) {
    return data && readData(isGrouponTicketRow, createGrouponRow, data);
}

function readExtraData(data) {
    return data && readData(isExtraTicketRow, createExtraRow, data);
}

const bptRows = readBptData(bptFileData) || [];
const gsRows = readGoldStarData(gsFileData) || [];
const grouponRows = readGrouponData(grouponFileData) || [];
const bptSeasonRows = readBptData(bptSeasonFileData, "BPT Season") || [];
const extraRows = readExtraData(extraFileData) || [];
let rows = [].concat(bptRows, gsRows, grouponRows, bptSeasonRows, extraRows);

function compressRows(rows) {
    rows = rows.sort((a, b) => a.last.localeCompare(b.last, 'en-US', { 'sensitivity': 'base' }));
    const outRows = [];
    let currentRow = undefined;
    for (let row of rows) {
        if (currentRow === undefined) {
            currentRow = row;
        } else {
            const success = currentRow.mergeRow(row);
            if (!success) {
                outRows.push(currentRow);
                currentRow = row;
            }
        }
    }
    if (currentRow) {
        outRows.push(currentRow);
    }
    return outRows;
}

function getOutputData(rows) {
    let out = `Last,First,Qty,Source,Tickets\n`;
    // rows = rows.sort();
    rows = compressRows(rows);
    for (let row of rows) {
        out += row.toString() + "\n";
    }
    return out;
}

const outData = getOutputData(rows);
fs.writeFileSync(outFile, outData);
