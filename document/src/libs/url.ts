export function resolvePath(path: string) {
    return process.env.NODE_ENV == "production" ? `/modern_robotics/${path}` : `/${path}`
}
