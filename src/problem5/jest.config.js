module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  forceExit: true,
  globalTeardown: './jest-teardown.js',
};
