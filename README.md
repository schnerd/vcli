![Screen Shot 2020-05-30 at 4 (1)](https://user-images.githubusercontent.com/875591/83340893-51d41580-a292-11ea-8e17-7073c447b997.jpg)

Quickly visualize CSV data from the command line

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
                       count/min/max/sum/mean/median/p5/p95)

  --facet=facet        Column index/name that will be used to group data into separate charts
  --port=port          Port to run the local webserver on (default is 8888)
```

vcli does not store or send any of your data over the internet – everything takes place on your local machine.

Because it visualizes your data using a browser, it is not useful during remote sessions like ssh or other headless environments.

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

# Troubleshooting

### Working with very large files

By default Node.js processes have 512mb of memory, if you are processing a very large file you could run into out of memory errors like the following:

```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

You can increase this memory limit by prepending your vcli command with an extra option:

```
export NODE_OPTIONS="--max_old_space_size=8192" && vcli ...
```

# Contributing

Contributions are welcome, see CONTRIBUTING.md
