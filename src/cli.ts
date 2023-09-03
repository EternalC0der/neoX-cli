#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

yargs(hideBin(process.argv))
    .scriptName('cross-types')
    .usage('$0 <cmd> [args]')
    // Use the commands directory to scaffold.
    .commandDir('commands')
    // Enable strict mode.
    .strict()
    // Useful aliases.
    .alias({ h: 'help', p: 'pull' }).argv
