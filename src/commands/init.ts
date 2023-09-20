import { writeFileSync, existsSync } from 'fs'
import type { Arguments } from 'yargs'

export const command: string = 'init'
export const desc: string = 'Creates a crosstypes.config.json with the recommended settings in the working directory.'

export const handler = (argv: Arguments): void => {
    try {
        // Check if a crosstypes.config.json file already exists. (using fs)
        if (existsSync('crosstypes.config.json')) {
            console.error('A crosstypes.config.json file already exists in the working directory!')
            process.exit(1)
        }

        // Create a crosstypes.config.json file in the working directory.
        const defaultConfig = {
            // Github repo url, can be public or private.
            // If you want to use a private repo, you need to generate a personal access token with the `repo` scope.
            repo: 'https://<token>@github.com/<user>/<repo>.git',
            outDir: '.cross_types'
        }
        writeFileSync('crosstypes.config.json', JSON.stringify(defaultConfig, null, 4))
    } catch (error) {
        console.error(error)
        console.error('**Failed** to initialize cross-types!')
        process.exit(1)
    }
    console.error('Successfully initialized cross-types!')
    process.exit(0)
}
