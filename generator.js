// Copyright (C) 2017 Doug Ilijev
// Licensed under the MIT License

'use strict';
const fs = require('fs');
const ArgumentParser = require('argparse').ArgumentParser;

const parser = new ArgumentParser({
    description: "Argparse description"
});

parser.addArgument(['--bpt'], { required: false, help: "Brown Paper Tickets (BPT) CSV File" });
parser.addArgument(['--bpt-season'], { required: false, help: "Brown Paper Tickets (BPT) Season Passes CSV File" });
parser.addArgument(['--groupon'], { required: false, help: "Groupon CSV File" });
parser.addArgument(['--groupon-season'], { required: false, help: "Groupon Season Passes CSV File" });
parser.addArgument(['--gs'], { required: false, help: "GoldStar CSV File" });
parser.addArgument(['--extra'], { required: false, help: "Extra entries such as reserved tickets" });
parser.addArgument(['--out'], { required: false, help: "Output File" });

const args = parser.parseArgs();

const bptFile = args['bpt'];
const bptSeasonFile = args['bpt_season'];
const gsFile = args['gs'];
const grouponFile = args['groupon'];
const grouponSeasonFile = args['groupon_season'];
const extraFile = args['extra'];
const outFile = args['out'] || 'list.csv'; // default value

let bptFileData;
if (bptFile) {
    console.log(`Reading BPT File: ${bptFile}`);
    bptFileData = fs.readFileSync(bptFile, 'utf8');
} else {
    console.log("INFO: No BPT File");
}

let bptSeasonFileData;
if (bptSeasonFile) {
    console.log(`Reading BPT Season File: ${bptSeasonFile}`);
    bptSeasonFileData = fs.readFileSync(bptSeasonFile, 'utf8');
} else {
    console.log("INFO: No BPT Season File");
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

let grouponSeasonFileData;
if (grouponSeasonFile) {
    console.log(`Reading Groupon Season File: ${grouponSeasonFile}`);
    grouponSeasonFileData = fs.readFileSync(grouponSeasonFile, 'utf8');
} else {
    console.log("INFO: No Groupon Season File");
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

String.prototype.toTitleCase = function() {
    // Ensure the first character of each part of the name is uppercase, make no assumptions about the rest.
    // (For example O'Connor and McLeary are properly cased, but making the rest of the name lowercase to handle
    // intentionally mis-cased names like "bIGGs" would cause correctly-cased names like McLeary to be cased incorrectly).

    // TODO: \w\S* works for now, but for names we probably actually just want something like \w+ (which would capitalize after ',
    // which is normally not what you'd want for TitleCase) -- needs testing.
    // Probably change the method name to toProperNameCase instead of toTitleCase
    // since it's a different application with slightly different rules.
    // Test case: o'connor -> O'Connor

    return this.replace(/\w\S*/g, function (match) { return match.charAt(0).toUpperCase() + match.substr(1); });
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
    const isValidLine = /^LG/.test(line);
    line = line.replace(/".*?"/, function (match) { return match.replace(/,/g, ""); }); // remove `,` within quotes
    if (isValidLine) {
        const isPurchased = line.indexOf("Purchased") >= 0;
        if (!isPurchased) {
            console.log(line);
        }
        return isPurchased;
    }
    return false;
}

function isExtraTicketRow(line) {
    return /,/.test(line);
}

function createBptRow(line, source) {
    const fields = line.split(/,/g);
    const last = fields[1].toTitleCase();
    const first = fields[2].toTitleCase();
    const qty = 1;
    const ticket = fields[0];
    return new Row(last, first, qty, source, ticket);
}

function createGoldStarRow(line) {
    const fields = line.split(/,/g);
    const last = fields[1].toTitleCase();
    const first = fields[2].toTitleCase();
    const qty = parseInt(fields[3]);
    const source = "GoldStar";
    const ticket = fields[7];
    return new Row(last, first, qty, source, ticket);
}

function createGrouponRow(line, source) {
    line = line.replace(/".*?"/, function (match) { return match.replace(/,/g, ""); }); // remove `,` within quotes
    const fields = line.split(/,/g);
    const name = fields[1].trim().toTitleCase(); // Owner's Name
    // const name = fields[21].trim().toTitleCase(); // Custom Field: name as appears on ID
    const nameParts = name.split(/ /g);
    const last = nameParts[nameParts.length - 1];
    const first = nameParts.slice(0, nameParts.length - 1).join(' ');
    const qty = 1;
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

function readGrouponData(data, source = "Groupon") {
    return data && readData(isGrouponTicketRow, createGrouponRow, data, source);
}

function readExtraData(data) {
    return data && readData(isExtraTicketRow, createExtraRow, data);
}

const bptRows = readBptData(bptFileData) || [];
const bptSeasonRows = readBptData(bptSeasonFileData, "BPT Season") || [];
const grouponRows = readGrouponData(grouponFileData) || [];
const grouponSeasonRows = readGrouponData(grouponSeasonFileData, "Groupon Season") || [];
const gsRows = readGoldStarData(gsFileData) || [];
const extraRows = readExtraData(extraFileData) || [];
let rows = [].concat(
    bptRows,
    bptSeasonRows,
    gsRows,
    grouponRows,
    grouponSeasonRows,
    extraRows
);

function reportRows(sourceList, rowsList) {
    for (let i = 0; i < sourceList.length; ++i) {
        if (sourceList[i]) {
            console.log(`Processed ${sourceList[i]}: found ${rowsList[i].length} rows`);
        }
    }
}

let sourceList = [
    bptFile,
    bptSeasonFile,
    gsFile,
    grouponFile,
    grouponSeasonFile,
    extraFile
];
let reportRowsList = [
    bptRows,
    bptSeasonRows,
    gsRows,
    grouponRows,
    grouponSeasonRows,
    extraRows
];

reportRows(sourceList, reportRowsList);
console.log(`Total rows found: ${rows.length}`);

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
    console.log(`Rows compressed down to ${rows.length} rows`);
    for (let row of rows) {
        out += row.toString() + "\n";
    }
    return out;
}

const outData = getOutputData(rows);
fs.writeFileSync(outFile, outData);
console.log(`Done! Output written to ${outFile}`);
