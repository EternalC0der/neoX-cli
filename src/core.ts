import { SimpleGitOptions } from 'simple-git'

export const defaultGitOptions: Partial<SimpleGitOptions> = {
    baseDir: `${process.cwd()}/.neoX`,
    config: []
}
