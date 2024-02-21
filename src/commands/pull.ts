import type { Arguments, CommandBuilder } from 'yargs'
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git'
import { defaultGitOptions } from '../core'
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'fs'
import { Config } from '../types'
import { rimraf } from 'rimraf'
import ora from 'ora'
import chalk from 'chalk'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Select } = require('enquirer')

type Options = {
    debug: boolean | undefined
}

export const command: string = 'pull'
export const desc: string = 'Pull type definitions from remote source into your `outDir` directory.'
export const aliases: string[] = ['p']
export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs.options({
        debug: { type: 'boolean' },
        all: { type: 'boolean' }, // alias for all
        a: { type: 'boolean' } // alias for all
    })
const spinner: ora.Ora = ora('empty text')
export const handler = async (argv: Arguments<Options>): Promise<void> => {
    const { debug, a, all } = argv

    // Load config from neoX.config.json
    let config: Config
    try {
        config = JSON.parse(readFileSync('neoX.config.json', 'utf8'))
    } catch (error) {
        console.error(`${chalk.red('[ Failed ]')} Failed to load config file, make sure you initialized neoX with \`${chalk.green(chalk.underline('neox init'))}\`!`)
        process.exit(1)
    }

    // Check if shared has no entries.
    if (!config.shared || !config.shared.length) {
        console.error(`${chalk.red('[ Failed ]')} Invalid config file, make sure you defined "shared" with at least one entry!`)
        process.exit(1)
    }

    const repos = config.shared.map((shared: any) => shared.outDir)

    const isAll = all || a
    let selected = isAll ? 'All' : undefined
    if (!isAll) {
        // Prompt user to select a repository to pull.
        const prompt = new Select({
            name: 'repo',
            message: 'Select a repository to pull:',
            choices: ['All', ...repos]
        })

        selected = await prompt.run()
    }

    if (selected === 'All') {
        for (const shared of config.shared) {
            spinner.text = `Processing ${shared.outDir || shared.repo}...\n`
            spinner.start()
            await processShared(shared, debug)
        }
    } else {
        const shared = config.shared.find((shared: any) => shared.outDir === selected)
        if (!shared) {
            spinner.text = `${chalk.red('[ Failed ]')} Failed to find \`${selected}\` directory!\n`
            spinner.fail()
            process.exit(1)
        }
        spinner.text = `Processing ${shared.outDir}...\n`
        spinner.start()
        await processShared(shared, debug)
    }

    process.exit(0)
}

async function processShared(shared: Config['shared'][0], debug?: boolean) {
    // Validate config
    // Check if config.repo is defined
    if (!shared.repo) {
        spinner.text = `${chalk.red('[ Failed ]')} Invalid config file, make sure you defined "repo" with a valid repository!\n`
        spinner.fail()
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
        spinner.text = `${chalk.red('[ Failed ]')} Failed to access \`${outDir}\` directory!\n`
        spinner.fail()
        process.exit(1)
    }

    // Download shared repo
    const state = await downloadShared(shared, initGit(outDir), isSubmodule, debug)
    spinner.color = 'magenta'
    if (state === 'clone') {
        spinner.text = 'Successfully **retrieved** data from remote source!\n'
    }
    if (state === 'pull') {
        spinner.text = 'Successfully **updated** data from remote source!\n'
    }

    // Post process shared repo
    await processSharedExclude(shared, outDir)
    if (!isSubmodule) {
        spinner.text = 'Removing .git directory... submodule is disabled.\n'
        await removeGitDir(outDir)
    }

    spinner.color = 'green'
    spinner.text = `📦 Successfully processed ${shared.outDir}!\n `
    spinner.succeed()
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
        spinner.text = `🧹 Removing \`${outDir}\` directory...\n`
        await rimraf(outDir)
    } catch (error) {
        spinner.text = `${chalk.red('[ Failed ]')} Failed to access \`${outDir}\` directory!\n`
        spinner.fail()
        process.exit(1)
    }
}

async function downloadShared(shared: Config['shared'][0], git: SimpleGit, isSubmodule: boolean, debug?: boolean): Promise<'clone' | 'pull'> {
    // Download shared repo
    try {
        spinner.color = 'yellow'
        spinner.text = `${chalk.yellow(' Downloading')} ${chalk.underline(shared.outDir)} from remote source...\n`
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

    spinner.text = `${chalk.red('[ Failed ]')} Failed to retrieve data from remote source!\n`
    spinner.fail()
    process.exit(1)
}

async function processSharedExclude(shared: Config['shared'][0], outDir: string) {
    // Validate config
    // Check if config.exclude is defined.
    if (!shared.exclude) {
        spinner.text = `${chalk.red('[ Failed ]')} Invalid config file, make sure you defined "exclude" with an array of files to exclude!\n`
        spinner.fail()
        process.exit(1)
    }

    // Process each exclude entry.
    for (const exclude of shared.exclude) {
        // Remove excluded file from outDir directory. if exists.
        try {
            if (existsSync(`${outDir}/${exclude}`)) {
                spinner.text = `[Exclude] Removing ${outDir}/${exclude}...\n`
                unlinkSync(`${outDir}/${exclude}`)
            }
        } catch (error) {
            spinner.text = `${chalk.red('[ Failed ]')} Failed to access \`${outDir}\` directory!\n`
            spinner.fail()
            process.exit(1)
        }
    }
}

async function removeGitDir(outDir: string) {
    // Remove .git directory if not submodule.
    try {
        if (existsSync(`${outDir}/.git`)) {
            spinner.text = 'Removing .git directory... submodule is disabled.\n'
            await rimraf(`${outDir}/.git`)
        }
    } catch (error) {
        spinner.text = `${chalk.red('[ Failed ]')} Failed to access \`.git\` directory!\n`
        spinner.fail()
        process.exit(1)
    }
}
