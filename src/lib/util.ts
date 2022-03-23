type Func<T> = {
    id: ReturnType<typeof setTimeout>;
    call: (a: any, args: T) => void;
}

export function debounce<T>(fun: Func<T> , delay: number) : (p: T) => void {
    return function (args: T) {
        const that = this
        const _args = args
        clearTimeout(fun.id)
        fun.id = setTimeout(function () {
            fun.call(that, _args)
        }, delay)
    }
}
