# Guest List Generator
[![Licensed under the MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/dilijev/guest-list-generator/blob/master/LICENSE.txt)

It is often the case that tickets for relatively small events are listed with
multiple online ticketing retailers with the hope of reaching as wide an audience as possible.
Since many of these retailers may not even offer a physical ticket, printed out tickets could be easily spoofed,
and merchants will not necessarily even have the equipment needed to scan a printed or mobile ticket,
check-in at ticketed events is usually done manually by event staff with a physical or digital list to confirm
that a guest has indeed purchased a ticket ahead of time.

These physical lists need to be created by someone in advance of the event.
Ticket sales might stay open as late as the night before an event,
and events may be early in the morning.
There could be many sources of sales from many different retailers, all in a different format.
Extracting the useful information from these lists can be time-consuming and error-prone,
especially when in a rush before the event.

For example, an orchestra which has two shows in a single weekend every 2-3 months may list tickets for sale
on Brown Paper Tickets, Gold Star, Groupon, and other retailers.
Additionally, they may offer a season pass for sale towards the beginning of the season,
which would need to be applied to all events.
Finally, a list of reserved or VIP tickets may be maintained separately.

Assuming the merchants offer downloads of ticket sales lists
in a reasonble format like CSV that stays consistent over time,
creating the list of guests is fairly straightforward and mechanical,
but because of the differences in formats, 

# Using This Software



# Roadmap

## Minor Bugs
* Use an actual CSV parser instead of hacking it (support commas within cells and escaped quotes (`"`)).
* For retailers which provide Full Name (instead of First, Last), improve logic for splitting out first and last names.

## Quality of Life Improvements
* Add ability to have multiple files from the same retailers
(handles possibility of similar listings for the same event which involve different offers or packages and are therefore priced differently).
* Improve the ability to easily add more retailers or input list types.
* Add ability to specify output table layout (give more semantic meaning to the input formats to allow this).

## Difficult / Low Value / Requires More Work Than Worthwhile
* General goal: Require less ahead-of-time work on the part of the operator of this program.
* Download the sources directly from the retailers instead of manually downloading.

# Acknowledgements

This software was created specifically for the purposes of the Seattle Festival Orchestra
but should be applicable to any similar group or merchant with a need to create guest lists from sales reports
from multiple online retailers.

Licensed under the MIT License.
See [LICENSE.txt](https://github.com/dilijev/guest-list-generator/blob/master/LICENSE.txt) for details.
