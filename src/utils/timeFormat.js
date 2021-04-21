const numberFormat = number => number.toString().padStart(2, '0')

export const secondsToTime = seconds => {
    const h = numberFormat(seconds / 3600 ^ 0)
    const m = numberFormat(seconds % 3600 / 60 ^ 0)
    const s = numberFormat(seconds % 60 ^ 0)
    return `${h}:${m}:${s}`
}