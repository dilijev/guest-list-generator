# Guest List Generator
[![Licensed under the MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/dilijev/guest-list-generator/blob/master/LICENSE.txt)

A merchant might list events on multiple online ticketing retailers to reach the widest audience possible.
Printed tickets could be easily spoofed, so a merchant would want to have a check-in at
at ticketed events where staff compares a ticket or ID with a known guest list
to confirm that a guest has indeed purchased a ticket ahead of time.

For example, an orchestra which has two shows in a single weekend every 2-3 months may list tickets for sale
on Brown Paper Tickets, Gold Star, Groupon, and possibly other retailers.
Additionally, they may offer a season pass for sale towards the beginning of the season,
which would need to be applied to all events.
Finally, a list of reserved or VIP tickets may be maintained separately.

Creating the list of guests is fairly straightforward and mechanical,
but because of the differences in formats, it is difficult and errors or omissions may result.
Ticket sales might stay open as late as the night before an event,
and events may be early in the morning.
Different retailers will all have a different format for tables of tickets purchased.
Additionally, the lists from each retailer may not be in a compact or easy-to-consult format,
may contain duplicate entries instead of a quantity of tickets, etc.

This program solves all these problems by simply taking in all of the source lists and producing a single,
compact table that can be used to check in guests at the door.

# Using This Software

* Get [Node.js](https://nodejs.org/).
* `git clone https://github.com/dilijev/guest-list-generator`
* `cd guest-list-generator`
* `npm install` (will install necessary libraries, e.g. `argparse`)
* Manually download your ticket sales lists from the retailers supported by this software and convert to CSV if necessary.
* Run e.g. `generator.js --bpt bpt.csv --bpt-season bpt-season.csv --gs gs.csv --groupon groupon.csv --extra extra.csv [--out list.csv]`
* Run `generator.js --help` for more information

# Roadmap

## Work Items
* Add tests with anonymized names and ticket numbers.
* Use an actual CSV parser instead of hacking it (support commas within cells and escaped quotes (`"`)).

## Minor Bugs
* For retailers which provide Full Name (instead of First, Last), improve logic for splitting out first and last names.

## Quality of Life Improvements
* Add ability to have multiple files from the same retailers
(handles possibility of similar listings for the same event which involve different offers or packages and are therefore priced differently).
* Improve the ability to easily add more retailers or input list types.
* Add ability to specify output table layout (give more semantic meaning to the input formats to allow this).
* General goal: Require less ahead-of-time work on the part of the operator of this program.

## Difficult / Low Value / Probably Not Worthwhile
* Download the sources directly from the retailers instead of manually downloading.

# Acknowledgements

This software was created specifically for use by the Seattle Festival Orchestra,
but should be applicable to any similar group or merchant with a need to create guest lists from sales reports
from multiple online retailers.

Licensed under the MIT License.
See [LICENSE.txt](https://github.com/dilijev/guest-list-generator/blob/master/LICENSE.txt) for details.
