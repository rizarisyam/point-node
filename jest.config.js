module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  moduleNameMapper: {
    '@root/(.*)': '<rootDir>/$1',
    '@src/(.*)': '<rootDir>/src/$1',
  },
};
