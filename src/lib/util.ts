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
export function timeSince(str: string, addBreak: boolean = false): string | undefined {
    const timeStamp = (new Date(str)).getTime()
    const now = new Date()
    const secondsPast = Math.round((now.getTime() - timeStamp) / 1000)
    if (secondsPast < 60) {
        return `${secondsPast} secs ago`
    }
    if (secondsPast <= 300) {
        return `${Math.round((secondsPast * 1) / 60)} min ago`
    }

    if (secondsPast > 300) {
        return dateTimeFmt(str)
    }
}

export function dateFmt(str: string) : string {
    const dt = new Date(str)
    return dt.toLocaleDateString()
}

export function timeFmt(str: string) : string {
    const dt = new Date(str)
    return dt.toLocaleTimeString(undefined, {
        hour12: false
    })
}

export function dateTimeFmt(str: string) : string {
    const dt = new Date(str)
    return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString(undefined, {
        hour12: false
    })}`
}