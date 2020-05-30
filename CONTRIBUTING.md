# Contributing

Contributions are welcome, as long as they are robust and are in line with the goals of vcli.

If you are planning to add a larger change or new feature, consider opening an issue first for discussion.

# Setup

After cloning the repository

```sh-session
$ npm install
```

Run in development mode, using `--dev` flag. This supports hot reloading for browser code (uses next.js).

```sh-session
$ vcli --dev data.csv
```

# Testing

At the moment there is only linting, no unit/integration tests – but you are welcome to add some to the project (preferable using Jest)

Run linting:

```js
npm test
```


