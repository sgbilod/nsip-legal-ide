import { beforeAll, afterAll } from '@jest/globals';

beforeAll(() => {
    console.log('Setting up tests...');
});

afterAll(() => {
    console.log('Cleaning up after tests...');
});