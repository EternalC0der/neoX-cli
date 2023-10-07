import type { Arguments, CommandBuilder } from 'yargs'
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git'
import { defaultGitOptions } from '../core'
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'fs'
import { Config } from '../types'
import { rimraf } from 'rimraf'

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
    // Load config from neoX.config.json
    let config: Config
    try {
        config = JSON.parse(readFileSync('neoX.config.json', 'utf8'))
    } catch (error) {
        console.error('**Failed** to load config file, make sure you initialized neoX with `neoX init`!')
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
    // Check if config.repo is defined
    if (!shared.repo) {
        console.error('**Invalid** config file, make sure you defined "repo" with a valid repository!')
        process.exit(1)
    }

    // Get isSubmodule from config or default to true
    const isSubmodule = typeof shared.isSubmodule === 'undefined' ? true : shared.isSubmodule

    // Remove outDir directory if not submodule.
    const outDir = shared.outDir || '.neoX'
    if (!isSubmodule) await removeOutDir(outDir)

    // Create outDir directory if it doesn't exist
    try {
        if (!existsSync(outDir)) mkdirSync(outDir)
    } catch (error) {
        console.error(`**Failed** to access \`${outDir}\` directory!`)
        process.exit(1)
    }

    // Download shared repo
    const state = await downloadShared(shared, initGit(outDir), isSubmodule, debug)
    if (state === 'clone') console.log('Successfully **retrieved** data from remote source!')
    if (state === 'pull') console.log('Successfully **updated** data from remote source!')

    // Post process shared repo
    await processSharedExclude(shared, outDir)
    if (!isSubmodule) await removeGitDir(outDir)
}

function initGit(outDir: string): SimpleGit {
    // Load git
    let baseDir = defaultGitOptions.baseDir!
    if (outDir) baseDir = baseDir.replace('/.neoX', `/${outDir}`)
    const git: SimpleGit = simpleGit({ ...defaultGitOptions, baseDir }).clean(CleanOptions.FORCE)
    return git
}

async function removeOutDir(outDir: string) {
    // Remove outDir directory if not submodule.
    try {
        console.log(`Removing \`${outDir}\` directory...`)
        await rimraf(outDir)
    } catch (error) {
        console.error(`**Failed** to access \`${outDir}\` directory!`)
        process.exit(1)
    }
}

async function downloadShared(shared: Config['shared'][0], git: SimpleGit, isSubmodule: boolean, debug?: boolean): Promise<'clone' | 'pull'> {
    // Download shared repo
    try {
        console.log('Downloading data from remote source...')
        await git.clone(shared.repo, '.')
        return 'clone'
    } catch (cloneError: any) {
        if (debug) console.error(cloneError)
        if (isSubmodule) {
            try {
                await git.pull(shared.repo, 'main')
                return 'pull'
            } catch (pullError: any) {
                if (debug) console.error(pullError)
            }
        }
    }

    console.error('**Failed** to retrieve data from remote source!')
    process.exit(1)
}

async function processSharedExclude(shared: Config['shared'][0], outDir: string) {
    // Validate config
    // Check if config.exclude is defined.
    if (!shared.exclude) {
        console.error('**Invalid** config file, make sure you defined "exclude" with an array of files to exclude!')
        process.exit(1)
    }

    // Process each exclude entry.
    for (const exclude of shared.exclude) {
        // Remove excluded file from outDir directory. if exists.
        try {
            if (existsSync(`${outDir}/${exclude}`)) {
                console.log(`[Exclude] Removing ${outDir}/${exclude}...`)
                unlinkSync(`${outDir}/${exclude}`)
            }
        } catch (error) {
            console.error(`**Failed** to access \`${outDir}\` directory!`)
            process.exit(1)
        }
    }
}

async function removeGitDir(outDir: string) {
    // Remove .git directory if not submodule.
    try {
        if (existsSync(`${outDir}/.git`)) {
            console.log('Removing .git directory... submodule is disabled.')
            await rimraf(`${outDir}/.git`)
        }
    } catch (error) {
        console.error(`**Failed** to access \`.git\` directory!`)
        process.exit(1)
    }
}
