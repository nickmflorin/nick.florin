import { buildCli } from './cli';

void buildCli().runExit(process.argv.slice(2));
