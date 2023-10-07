export type Config = {
    shared: { repo: string; outDir?: string; isSubmodule?: boolean; exclude: string[] }[]
}
