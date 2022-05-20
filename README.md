# Discussion Group Sorter

This program was written to sort students into discussion groups for the 2022 Protestant Reformed Young People's Convention. It takes a list of around 500 students, each with their gender, grade, and their 3 choices of 12 available discussion group topics, and sorts them into around 30 groups per day (where each day has one scheduled discussion group time), leading to a total of around 90 groups over all 3 days.

Each group averages around 15-20 students, and since there are multiple groups per topic, groups within a topic have an even distribution between gender and grade to help with having a balanced discussion. The topics are balanced between days as well, so that group leaders have maximum opportunity to focus on the same topic from one day to the next.

## Prerequisites

- Node.js / PNPM (or NPM)

## Usage:

```
$ pnpm install
$ pnpm start <input-file>.xlsx <output-file>.xlsx
```

To run based on sample input:

```
$ pnpm codegen
$ pnpm start examples/sample-input.csv sample-output.xlsx
```

To build for lightweight running:

```
$ pnpm build
$ node main.js <input-file>.xlsx <output-file>.xlsx
```

## Input File:
An Excel or a CSV file with the following columns (including column label header):

- Last Name
- First Name
- Gender
- Grade
- Church
- Discussion Group Topics (Three, separated by '|')

## Output File:

An Excel file with the following sheets:

- *Group Index:* Overview of groups per day and the breakdown of students within them (bottom section)
- *Tues/Wed/Thurs Groups:* Groups by letter and topic with list of students in each group.
- *Wristbands:* All students with what their group schedule in letters, e.g.: [ Adams | Sam | D, G, B ]
- *Topic Breakdown:* Overview of how many students chose which topics by gender and grade.
