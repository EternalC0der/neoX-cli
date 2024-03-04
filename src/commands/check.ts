import type { Arguments, CommandBuilder } from 'yargs'
import { simpleGit, SimpleGit } from 'simple-git'
import { defaultGitOptions } from '../core'
import { readFileSync } from 'fs'
import { Config } from '../types'
import ora from 'ora'
import chalk from 'chalk'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Select } = require('enquirer')

type Options = {
    all: boolean | undefined
    target: string | undefined
}
interface CheckMessage {
    text: string
    isUpToDate: boolean
}

export const command: string = 'check'
export const desc: string = 'check exising new commit in remote source'
export const aliases: string[] = ['c']
export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs.options({
        all: { type: 'boolean' },
        target: { type: 'string' }
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

    let repos = []
    if (argv.target && argv.target !== '') {
        for (const shared of config.shared) {
            if (shared.outDir === argv.target) {
                repos.push(shared)
                break
            }
        }
    } else {
        repos = config.shared
    }
    const messages: CheckMessage[] = []

    for (const shared of repos) {
        if (!shared.isSubmodule) {
            messages.push({
                isUpToDate: false,
                text: `${chalk.red(' Failed ')} [ ${chalk.underline(shared.outDir || shared.repo)} ] Failed to process ${
                    shared.repo
                }, make sure you defined "outDir" in your config file!`
            })
            continue
        }
        spinner.text = `${chalk.blue('[ Checking ]')} Processing ${shared.outDir || shared.repo}...\n`
        spinner.start()
        if (!shared.outDir) {
            messages.push({
                isUpToDate: false,
                text: `${chalk.red(' Failed ')} [ ${chalk.underline(shared.outDir)} ] Failed to process ${shared.repo}, make sure you defined "outDir" in your config file!`
            })
            continue
        }

        const git = iniGit(shared.outDir as string)
        const lastCommitFromLocal = await git.log(['-1'])

        const data = await git.listRemote(['--heads', 'origin'])
        const remoteBranches = data.split('\n')
        const lastCommitHash = remoteBranches.filter((branch) => branch.includes('refs/heads')).map((branch) => branch.split('\t')[0].split(' ')[0])[0]

        if (lastCommitFromLocal.latest?.hash !== lastCommitHash) {
            messages.push({
                isUpToDate: false,
                text: [
                    `${chalk.yellow(' Warning ')}`,
                    `[ ${chalk.underline(shared.outDir)} ] `,
                    `You have new commit in remote source, please pull the lastest commit with \`${chalk.green(chalk.underline('neox pull'))}\`!`
                ].join('')
            })
        } else {
            messages.push({
                isUpToDate: true,
                text: [`${chalk.green(' Up-to-date ')}`, `[ ${chalk.underline(shared.outDir)} ]  You are up-to-date with ${chalk.underline(shared.outDir)}!`].join('')
            })
        }
    }

    // if (messages.length > 0) {
    //     spinner.stop()
    //     console.log(messages.join('\n'))
    //     process.exit(1)
    // } else process.exit(0)
    const WaringLength = messages.filter((message) => !message.isUpToDate).length
    if (WaringLength > 0) {
        spinner.stop()
        const sortedMessages = messages.sort((a, b) => (a.isUpToDate === b.isUpToDate ? 0 : a.isUpToDate ? 1 : -1))
        const text: string = sortedMessages.map((message) => message.text).join('\n')
        console.log(text)
        process.exit(1)
    } else {
        spinner.stop()
        console.log(messages.map((message) => message.text).join('\n'))
        process.exit(0)
    }
}

function iniGit(outDir: string): SimpleGit {
    // Load git
    let baseDir = defaultGitOptions.baseDir!
    if (outDir) baseDir = baseDir.replace('/.neoX', `/${outDir}`)
    const git: SimpleGit = simpleGit({ ...defaultGitOptions, baseDir })
    return git
}
