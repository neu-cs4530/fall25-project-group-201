const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: './',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-markdown$': '<rootDir>/tests/__mocks__/react-markdown.tsx',
    '^remark-gfm$': '<rootDir>/tests/__mocks__/remark-gfm.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;