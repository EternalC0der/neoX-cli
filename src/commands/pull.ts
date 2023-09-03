import type { Arguments } from 'yargs'
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git'
import { defaultGitOptions } from '../core'
import { existsSync, mkdirSync } from 'fs'

export const command: string = 'pull'
export const desc: string = 'Pull type definitions from remote source into .cross_types directory.'

export const handler = async (argv: Arguments): Promise<void> => {
    const _testConfig = {
        repo: 'https://github.com/Neural-Novin/neuralnovin-cross-types.git'
    }

    // Create .cross_types directory if it doesn't exist.
    if (!existsSync('.cross_types')) mkdirSync('.cross_types')

    // Load git
    // if (_testConfig.accessToken) defaultGitOptions.config?.push(`Authorization: token ${_testConfig.accessToken}`)
    const git: SimpleGit = simpleGit(defaultGitOptions).clean(CleanOptions.FORCE)

    // git.clone(_testConfig.repo, '.cross_types', [''])
    const status = await git.status()
    console.log({ status })
    // process.stdout.write()
    process.exit(0)
}
