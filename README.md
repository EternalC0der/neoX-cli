# 🚀 neoX

[![npm version](https://badge.fury.io/js/neoX.svg)](https://badge.fury.io/js/neoX)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📝 Description

neoX is a powerful CLI tool and library that aims to solve the problem of duplicated TypeScript interfaces and types across different codebases. By allowing you to create a centralized repository (public or private) with all your shared TypeScript definitions, you can easily manage and synchronize them in your projects. It even allows you to include a custom `tsconfig.json` for more advanced usage.

## 🛠 Installation

### Local Installation

```bash
npm install neox-cli
```

or 

```bash
yarn add neox-cli
```

### Global Installation

Install neox-cli globally for system-wide accessibility.

```bash
npm install -g neox-cli
```

or 

```bash
yarn global add neox-cli
```

## ⚡ Quick Start

After installing the package, use the CLI like so:

For local installation:

```bash
npx neox-cli init
```

For global installation:

```bash
neox-cli init
```

Or using the alias:

```bash
neox init
```

## 📘 Usage

### CLI

#### Initialization

Run `neox-cli init` or its alias `neox init` to set up your centralized type repository.

```bash
neoX init
```

This creates a `neoX.config.json` in your current directory with recommended settings.

#### Pulling Types

To update your local type definitions from your centralized repository, run:

```bash
neox-cli pull
```

or its alias

```bash
neox pull
```

### Advanced Usage: Custom `tsconfig.json`

neoX allows you to include a custom `tsconfig.json` in your centralized repository for advanced type management. To leverage this in your project, you can extend it like so:

```json
{
  "extends": "./.neoX/tsconfig.json",
  // your custom overrides here
}
```

This gives you the freedom to set up paths, aliases, or any other TypeScript compiler options for the types you're pulling in.

### Programmatic Use

neoX can also be integrated directly into your TypeScript projects. More documentation to come.

## 📦 API

### `init()`

Initializes neoX, setting up a `neoX.config.json` in the current directory.

### `pull()`

Updates your local type definitions from your centralized type repository.

## 📣 Contributing

1. Fork the repo (https://github.com/EternalC0der/neox-cli/fork)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## 📝 License

MIT © [EternalC0der](https://github.com/EternalC0der)
