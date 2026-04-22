module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'models/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
  ],
  testMatch: ['**/test/**/*.test.js'],
  testTimeout: 10000,
  forceExit: true,
  clearMocks: true,
};
