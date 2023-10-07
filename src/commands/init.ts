import { writeFileSync, existsSync } from 'fs'
import type { Arguments } from 'yargs'

export const command: string = 'init'
export const desc: string = 'Creates a neoX.config.json with the recommended settings in the working directory.'

export const handler = (argv: Arguments): void => {
    try {
        // Check if a neoX.config.json file already exists. (using fs)
        if (existsSync('neoX.config.json')) {
            console.error('A neoX.config.json file already exists in the working directory!')
            process.exit(1)
        }

        // Create a neoX.config.json file in the working directory.
        //     Github repo url, can be public or private.
        //     If you want to use a private repo, you need to generate a personal access token with the `repo` scope.
        const defaultConfig = {
            shared: [
                {
                    repo: 'https://<token>@github.com/<user>/<repo>.git',
                    outDir: '.neoX',
                    isSubmodule: true,
                    exclude: []
                }
            ]
        }
        writeFileSync('neoX.config.json', JSON.stringify(defaultConfig, null, 4))
    } catch (error) {
        console.error(error)
        console.error('**Failed** to initialize neoX!')
        process.exit(1)
    }
    console.error('Successfully initialized neoX!')
    process.exit(0)
}
