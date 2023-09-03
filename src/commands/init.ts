import { writeFileSync, existsSync } from 'fs'
import type { Arguments } from 'yargs'
type DefaultConfig = {
    repo: string
    private: boolean
    accessToken?: string
}

export const command: string = 'init'
export const desc: string = 'Creates a crosstypes.config.json with the recommended settings in the working directory.'

export const handler = (argv: Arguments): void => {
    // Check if a crosstypes.config.json file already exists. (using fs)
    if (existsSync('crosstypes.config.json')) {
        process.stderr.write('A crosstypes.config.json file already exists in the working directory!')
        process.exit(1)
    }

    // Create a crosstypes.config.json file in the working directory.
    const defaultConfig: DefaultConfig = {
        repo: '',
        private: false,
        accessToken: ''
    }
    writeFileSync('crosstypes.config.json', JSON.stringify(defaultConfig, null, 4))

    process.exit(0)
}
