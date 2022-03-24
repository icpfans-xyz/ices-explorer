type Func<T> = {
    id: ReturnType<typeof setTimeout>
    call: (a: any, args: T) => void
}

export function debounce<T>(fun: Func<T>, delay: number): (p: T) => void {
    return function (args: T) {
        const that = this
        const _args = args
        clearTimeout(fun.id)
        fun.id = setTimeout(function () {
            fun.call(that, _args)
        }, delay)
    }
}
export const shortAccount = (accountId: string): string =>
    `${accountId.slice(0, 8)}...${accountId.slice(-8)}`

export const shortPrincipal = (principal: string): string => {
    // const parts = (typeof principal === 'string' ? principal : principal.toText()).split('-')
    return `${principal[0]}...${principal.slice(-1)[0]}`
}
