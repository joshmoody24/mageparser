# Mageparser

A minimalist programming language with a Lisp-like syntax that builds complex operations from primitive functions.

## Overview

Mageparser is a domain-specific language (DSL) implementation that uses a minimal set of primitive operations (subtract, sign, if, and one) to construct a functional programming language. The project includes a parser, an interpreter, and a test suite.

## How It Works

- **Parser**: Uses Nearley.js to define grammar rules in `dsl.ne`
- **Interpreter**: Evaluates parsed abstract syntax tree (AST) nodes
- **Core Principles**:
  - Lisp-like syntax with prefix notation: `(subtract 3 1) #=> 2`
  - Functional programming with support for closures
  - Variable bindings using `bind x to value in`
  - Lambda functions: `[param1 param2] -> expression`

## Language Features

- **Primitive Operations**: subtract, sign, if, and one
- Everything else can be built from these primitives. For example:
  - `bind zero to (subtract one one) in`
  - `bind negative to [x] -> (subtract 0 x) in`
  - `bind add to [x y] -> (subtract x (negative y)) in`

## Installation

```bash
npm install
```

## Usage

```bash
# Build the parser
npm run build

# Run the REPL (interactive shell)
npm run repl

# Run the REPL with raw input (no common definitions)
npm run repl-raw

# Process a file
node src/index.js <input-file>

# Run tests
npm test
```

## Example

```
# Define a function to double a number
bind DOUBLE to [x] -> (mul x 2) in

# Define a function to check if a number is even
bind EVEN? to [x] -> (EQUALS? (mul (DIV x 2) 2) x) in

# Use the functions
(DOUBLE 3)  # Returns 6
(EVEN? 4)   # Returns 1 (true)
```

