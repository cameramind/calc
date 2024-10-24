# Testing Camera Calculator

This document outlines the testing strategy and procedures for the Camera Calculator project.

## Unit Tests

We use [Jest](https://jestjs.io/) for unit testing. To run the tests:

1. Install dependencies: `npm install`
2. Run tests: `npm test`

### Writing Unit Tests

When writing unit tests:

1. Create a new file with the `.test.js` extension in the `__tests__` directory.
2. Import the necessary modules and the function/class you're testing.
3. Use Jest's `describe` and `it` functions to organize your tests.
4. Use Jest's `expect` function for assertions.

Example:
