export type LogType = {
    block?: number
    caller?: string
    caller_time?: string
    canister_id?: string
    event_key?: string
    event_value?: string
    from_addr?: string
    global_id?: string
    ices_time?: string
    id?: number
    nonce?: number
    to_addr?: string
    type: string
    key?: number
}

export type EventValue = {
    sub_key: string
    sub_value: string
    indexed: boolean
}

type eq = {
    _eq: string
}
export type EventKey = {
    event_key: eq
}
export type EventKeys = {
    title: string
    value: string
    key: string
}
export type CanisterEventKey = {
    canister_id?: string
    event_key?: string
}

export type EventCountType = {
    id?: number
    time: string
    counts: number
}

type OR = {
    event_key: {
        _eq: string;
    };
}
export type WhereType = {
    _and?: {
        caller: {
            _eq: string;
        }
    };
    _or?: OR[];
    canister_id?: {
        _eq: string | undefined;
    };
    caller?: {
        _eq: string | undefined;
    };
}