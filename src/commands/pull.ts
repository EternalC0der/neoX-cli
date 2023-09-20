import type { Arguments, CommandBuilder } from 'yargs'
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git'
import { defaultGitOptions } from '../core'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { Config } from '../types'

type Options = {
    debug: boolean | undefined
}

export const command: string = 'pull'
export const desc: string = 'Pull type definitions from remote source into your `outDir` directory.'

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
        console.error('**Failed** to load config file, make sure you initialized cross-types with `cross-types init`!')
        process.exit(1)
    }

    // Check if shared has no entries.
    if (!config.shared || !config.shared.length) {
        console.error('**Invalid** config file, make sure you defined "shared" with at least one entry!')
        process.exit(1)
    }

    // Process each shared entry.
    for (const shared of config.shared) {
        console.log(`Processing ${shared.outDir || shared.repo}...`)
        await processShared(shared, debug)
    }

    process.exit(0)
}

async function processShared(shared: Config['shared'][0], debug?: boolean) {
    // Validate config
    // Check if config.repo is defined.
    if (!shared.repo) {
        console.error('**Invalid** config file, make sure you defined "repo" with a valid repository!')
        process.exit(1)
    }

    // Create outDir directory if it doesn't exist.
    const outDir = shared.outDir || '.cross_types'
    try {
        if (!existsSync(outDir)) mkdirSync(outDir)
    } catch (error) {
        console.error(`**Failed** to access \`${outDir}\` directory!`)
        process.exit(1)
    }

    // Load git
    let baseDir = defaultGitOptions.baseDir!
    if (outDir) baseDir = baseDir.replace('/.cross_types', `/${outDir}`)
    const git: SimpleGit = simpleGit({ ...defaultGitOptions, baseDir }).clean(CleanOptions.FORCE)

    let action: 'clone' | 'pull' | 'none' = 'none'
    try {
        await git.clone(shared.repo, '.')
        action = 'clone'
    } catch (cloneError: any) {
        if (debug) console.error(cloneError)
        try {
            await git.pull(shared.repo, 'main')
            action = 'pull'
        } catch (pullError: any) {
            if (debug) console.error(pullError)
        }
    }

    const status = await git.status()
    if (debug) console.log('Status:', status)
    if (action === 'none') {
        console.error('**Failed** to retrieve data from remote source!')
        process.exit(1)
    }
    if (action === 'clone') {
        console.log('Successfully **retrieved** data from remote source!')
    }
    if (action === 'pull') {
        console.log('Successfully **updated** data from remote source!')
    }
}
