# 🚀 Cross-Types

[![npm version](https://badge.fury.io/js/cross-types.svg)](https://badge.fury.io/js/cross-types)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📝 Description

Cross-Types is a powerful CLI tool and library that aims to solve the problem of duplicated TypeScript interfaces and types across different codebases. By allowing you to create a centralized repository (public or private) with all your shared TypeScript definitions, you can easily manage and synchronize them in your projects. It even allows you to include a custom `tsconfig.json` for more advanced usage.

## 🛠 Installation

### Local Installation

```bash
npm install cross-types
```

or 

```bash
yarn add cross-types
```

### Global Installation

Install Cross-Types globally for system-wide accessibility.

```bash
npm install -g cross-types
```

or 

```bash
yarn global add cross-types
```

## ⚡ Quick Start

After installing the package, use the CLI like so:

For local installation:

```bash
npx cross-types init
```

For global installation:

```bash
cross-types init
```

Or using the alias:

```bash
ct init
```

## 📘 Usage

### CLI

#### Initialization

Run `cross-types init` or its alias `ct init` to set up your centralized type repository.

```bash
cross-types init
```

This creates a `crosstypes.config.json` in your current directory with recommended settings.

#### Pulling Types

To update your local type definitions from your centralized repository, run:

```bash
cross-types pull
```

or its alias

```bash
ct pull
```

### Advanced Usage: Custom `tsconfig.json`

Cross-Types allows you to include a custom `tsconfig.json` in your centralized repository for advanced type management. To leverage this in your project, you can extend it like so:

```json
{
  "extends": "./.cross_types/tsconfig.json",
  // your custom overrides here
}
```

This gives you the freedom to set up paths, aliases, or any other TypeScript compiler options for the types you're pulling in.

### Programmatic Use

Cross-Types can also be integrated directly into your TypeScript projects. More documentation to come.

## 📦 API

### `init()`

Initializes Cross-Types, setting up a `crosstypes.config.json` in the current directory.

### `pull()`

Updates your local type definitions from your centralized type repository.

## 📣 Contributing

1. Fork the repo (https://github.com/EternalC0der/cross-types/fork)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## 📝 License

MIT © [EternalC0der](https://github.com/EternalC0der)
