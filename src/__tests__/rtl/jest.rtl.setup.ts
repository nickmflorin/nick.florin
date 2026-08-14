import '@testing-library/jest-dom';

/* Jest evaluates this file before each test file in the module, and Node re-reads 'process.env.TZ'
   on the next date operation, so the assignment fixes the timezone for every date the suite
   constructs or formats. */
process.env.TZ = 'UTC';
