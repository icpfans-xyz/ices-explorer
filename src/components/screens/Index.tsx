import { Head } from '~/components/shared/Head'
import { useEffect, useState, useRef } from 'react'
import { gql } from 'graphql-request'
import { Table, Tag } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { graphQLClient } from '~/config'
import { LogType, EventValue } from './type'
import { shortAccount } from '~/lib/util'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import AllMarketCard from '~/components/charts/AllMarketCard'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
// console.log(dayjs(dayjs().subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss')).fromNow())
const columns = [
    { title: 'INDEX', dataIndex: 'block', key: 'block' },
    {
        title: 'CANISTER ID',
        dataIndex: 'canister_id',
        key: 'canister_id',
        render: (text: string) => <Link to={`/canister/${text}`}>{shortAccount(text)}</Link>
    },
    { title: 'EVENT KEY', dataIndex: 'event_key', key: 'event_key' },
    {
        title: 'EVENT VALUE',
        dataIndex: 'event_value',
        key: 'event_value',
        render: (values: string) => {
            try {
                const arr = JSON.parse(values)
                return arr.map((item: EventValue, index: number) => {
                    return (
                        <div key={index}>
                            <Tag key={item.sub_key}>{item.sub_key}</Tag>

                            {item.sub_key === 'from' || item.sub_key === 'to' ? (
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href={`https://ic.rocks/principal/${item.sub_value}`}>
                                    {shortAccount(item.sub_value)}
                                </a>
                            ) : (
                                item.sub_value
                            )}
                        </div>
                    )
                })
            } catch (err) {
                console.log(err)
            }
        }
    },
    {
        title: 'CALLER',
        dataIndex: 'caller',
        key: 'caller',
        render: (text: string) => <Link to={`/caller/${text}`}>{shortAccount(text)}</Link>
    },
    { title: 'TIME', dataIndex: 'ices_time', key: 'ices_time',
        render: (text: string) => {
            const d1 = dayjs(text).utc(true)
            const d2 = dayjs()
            return <span>{d2.diff(d1, 'hour')  > 12 ? d1.format('YYYY-MM-DD HH:mm:ss') : dayjs(dayjs().subtract(d2.diff(d1, 'hour'), 'hour')).fromNow()}</span>
        }
    }
]
const Index = () => {
    const [logs, setLogs] = useState<LogType[]>([])
    const [currentPage, setPage] = useState(1)
    const [offset, setOffset] = useState(10)
    const [total, setTotal] = useState(0)
    const search = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    function changeSize(current: number, size: number) {
        setOffset(size)
    }

    async function getEventLogAll() {
        const query = gql`
        query MyQuery {
            t_event_logs_v1(order_by: {ices_time: desc}, limit: ${offset}, offset: ${
    offset * (currentPage - 1)
}) {
                block
                caller
                caller_time
                canister_id
                event_key
                event_value
                from_addr
                global_id
                ices_time
                id
                nonce
                to_addr
                type
            }
        }`
        const res = await graphQLClient.request(query)
        setLogs(
            res.t_event_logs_v1.map((v: LogType, i: number) => {
                v.key = i + 1
                return v
            })
        )
    }
    async function getLogTotal() {
        const query = gql`
            query MyQuery {
                t_event_logs_v1_aggregate {
                    aggregate {
                        count
                    }
                }
            }
        `

        const res = await graphQLClient.request(query)
        setTotal(res.t_event_logs_v1_aggregate.aggregate.count)
    }

    function handleSearch() {
        if (search.current) {
            const str = search.current.value.trim()
            if (str.length === 27) {
                navigate(`/canister/${str}`)
                return false
            }
            if (str.length === 63) {
                navigate(`/caller/${str}`)
                return false
            }
            if (str.length === 9) {
                navigate(`/caller/${str}`)
                return false
            }
            navigate('/search')
        }
    }
    useEffect(() => {
        getEventLogAll()
    }, [currentPage, offset])
    useEffect(() => {
        getLogTotal()
    }, [])
    return (
        <>
            <Head title="ICES | Home Page" />
            <div className="w-3/4 pt-20 form-control">
                <div className="input-group">
                    <input ref={search} type="text" placeholder="Search by Canister Id, Principal Id" className="input input-bordered w-full h-14 text-lg" />
                    <button className="btn btn-square h-14 w-20 bg-gray-400 border-gray-400" onClick={handleSearch}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex justify-between w-full mt-20 space-x-10 h-52">
                <AllMarketCard  typeName="v1_all_event_count" stroke="#82ca9d" fill="#82ca9d" title="Events" />
                <AllMarketCard  typeName="v1_all_canister_count" stroke="#2789f1" fill="#4ca1ea" title="Integrated Canisters" />
                <AllMarketCard  typeName="v1_all_caller_count" stroke="#f33968" fill="#f279ee" title="Caller" />
            </div>
            <h2 className="mt-20 card-title">Lates Events</h2>
            <div className="w-full shadow-xl card bg-base-100">
                <div className="card-body">
                    <Table
                        columns={columns}
                        pagination={{
                            current: currentPage,
                            total: total,
                            pageSize: offset,
                            // itemRender={PageItem}
                            onShowSizeChange: changeSize,
                            onChange: setPage,
                            pageSizeOptions: [10, 30, 50, 100],
                            // hideOnSinglePage={false}
                            showSizeChanger: true,
                            showQuickJumper: true,
                            simple: false,
                            // simple
                            showTotal: (total) => `Total ${total} items`
                        }}
                        dataSource={logs}
                    />
                </div>
            </div>
        </>
    )
}

export default Index
