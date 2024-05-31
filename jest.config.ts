import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  maxWorkers: 2,
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.controller.ts',
    '<rootDir>/src/**/*.service.ts',
    '<rootDir>/src/utils/**/*.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text-summary', 'text'],
  rootDir: '.',
  transform: { '^.+\\.(ts)$': 'ts-jest' },
};

if (process.env.REPORT_COVERAGE_FILE == 'true') {
  config.coverageReporters = ['text-summary', 'text', 'json-summary', 'json'];
}

export default config;
