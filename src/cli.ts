#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

yargs(hideBin(process.argv))
    .scriptName('ct')
    .usage('$0 <cmd> [args]')
    // Use the commands directory to scaffold.
    .commandDir('commands')
    // Enable strict mode.
    .strict()
    // Show help if no command is provided.
    .demandCommand()
    // Useful aliases.
    .alias({ h: 'help', p: 'pull' }).argv
