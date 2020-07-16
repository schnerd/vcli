![Screen Shot 2020-05-30 at 4 (1)](https://user-images.githubusercontent.com/875591/83340893-51d41580-a292-11ea-8e17-7073c447b997.jpg)

2

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/vcli.svg)](https://npmjs.org/package/vcli)
[![Downloads/week](https://img.shields.io/npm/dw/vcli.svg)](https://npmjs.org/package/vcli)
[![License](https://img.shields.io/npm/l/vcli.svg)](https://github.com/schnerd/vcli/blob/master/package.json)

* [Install](#install)
* [Usage](#usage)
* [Examples](#examples)
* [Contributing](#contributing)

# Install

## Installing as npm package

1. Install node.js via [package manager](https://nodejs.org/en/download/package-manager/#macos) or [download](https://nodejs.org/en/download/), if you haven't already.

2. Install the vcli package globally

```sh-session
$ npm install -g vcli
```

# Usage

```sh-session
USAGE
  $ vcli [FILE]
  $ cat [FILE] | vcli

ARGUMENTS
  FILE  Path to CSV file (instead of piping data into vcli)

OPTIONS
  -h, --help           show CLI help
  -v, --version        show CLI version

  -x, --x-axis=x-axis  Column index/name to plot on x-axis of charts. For date fields you can specify an aggregate function like start_date:month
                       (supports day/month/year)

  -y, --y-axis=y-axis  Column index/name to plot on y-axis of charts. You can also specify an aggregate function like sales:sum (supports
                       min/max/sum/mean/median/p5/p95)

  --facet=facet        Column index/name that will be used to group data into separate charts
```

# Examples 

### Launch "Overview" visualization with stats & distributions for all columns in the file

```sh-session
$ vcli data.csv
```

### Launch "Analysis" visualization with specified configuration

```sh-session
$ vcli -x date:month -y cases:sum --facet state data.csv
```

### Pipe CSV data from an API into vcli

```sh-session
$ curl -s https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv | vcli
```

# Contributing

Contributions are welcome, see CONTRIBUTING.md
