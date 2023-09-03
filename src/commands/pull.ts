import type { Arguments, CommandBuilder } from 'yargs'
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git'
import { defaultGitOptions } from '../core'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { Config } from '../types'

type Options = {
    debug: boolean | undefined
}

export const command: string = 'pull'
export const desc: string = 'Pull type definitions from remote source into .cross_types directory.'

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs.options({
        debug: { type: 'boolean' }
    })

export const handler = async (argv: Arguments<Options>): Promise<void> => {
    const { debug } = argv
    // Load config from crosstypes.config.json
    let config: Config
    try {
        config = JSON.parse(readFileSync('crosstypes.config.json', 'utf8'))
    } catch (error) {
        process.stderr.write('**Failed** to load config file, make sure you initialized cross-types with `cross-types init`!')
        process.exit(1)
    }

    // Create .cross_types directory if it doesn't exist.
    try {
        if (!existsSync('.cross_types')) mkdirSync('.cross_types')
    } catch (error) {
        process.stderr.write('**Failed** to access .cross_types directory!')
        process.exit(1)
    }

    // Load git
    const git: SimpleGit = simpleGit(defaultGitOptions).clean(CleanOptions.FORCE)

    let action: 'clone' | 'pull' | 'none' = 'none'
    try {
        await git.clone(config.repo, '.')
        action = 'clone'
    } catch (cloneError: any) {
        if (debug) console.error(cloneError)
        try {
            await git.pull(config.repo, 'main')
            action = 'pull'
        } catch (pullError: any) {
            if (debug) console.error(pullError)
        }
    }

    const status = await git.status()
    if (debug) console.log('Status:', status)
    if (action === 'none') {
        process.stderr.write('**Failed** to retrieve data from remote source!')
        process.exit(1)
    }
    if (action === 'clone') {
        process.stdout.write('Successfully **retrieved** data from remote source!')
        process.exit(0)
    }
    if (action === 'pull') {
        process.stdout.write('Successfully **updated** data from remote source!')
        process.exit(0)
    }

    process.exit(0)
}
