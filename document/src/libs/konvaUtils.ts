export function globalToMap(width: number, height: number, x: number, y: number, resolution: number = 0.05) {
    return {
        x: width / 2 + x / resolution,
        y: height / 2 - y / resolution
    }
}

export function mapToGlobal(width: number, height: number, x: number, y: number, resolution: number = 0.05) {
    return {
        x: (x - width / 2) * resolution,
        y: (height / 2 - y) * resolution
    }
}

