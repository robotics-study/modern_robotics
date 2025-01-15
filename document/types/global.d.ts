export interface GitMetadata {
    id: string,
    avatar_url: string,
    url: string,
    repos_url: string
}

declare module "*.json" {
    const value: GitMetadata
    export default value
}
