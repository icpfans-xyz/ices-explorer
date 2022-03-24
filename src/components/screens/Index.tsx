import { Head } from '~/components/shared/Head'
import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Table } from 'antd'
import { Link } from 'react-router-dom'
import { graphQLClient } from '~/config'
import { LogType, EventCountType } from './type'
import { shortAccount } from '~/lib/util'
const columns = [
    { title: 'BLOCK', dataIndex: 'block', key: 'block' },
    { width: 120, title: 'CANISTER ID', dataIndex: 'canister_id', key: 'canister_id', render: (text: string) => <Link to={`/canister/${text}`}>{shortAccount(text)}</Link> },
    { title: 'EVENT KEY', dataIndex: 'event_key', key: 'event_key' },
    // { title: 'TYPE', dataIndex: 'type', key: 'type' },
    Table.EXPAND_COLUMN,
    { title: 'EVENT VALUE', dataIndex: 'event_value', key: 'event_value' },
    { width: 120, title: 'CALLER', dataIndex: 'caller', key: 'caller', render: (text: string) => <Link to={`/canister/${text}`}>{shortAccount(text)}</Link> },
    { title: 'CREATE TIME', dataIndex: 'ices_time', key: 'ices_time' }
]
const Index = () => {
    const [logs, setLogs] = useState<LogType[]>([])
    // const [day, setDay] = useState(7)
    const [eventCount7d, setEventCount7d] = useState<EventCountType[]>([])
    const [eventCountAll, setEventCountAll] = useState(0)
    const [canisterCount7d, setCanisterCount7d] = useState<EventCountType[]>([])
    const [canisterCountAll, setCanisterCountAll] = useState(0)
    const [callerCount7d, setCallerCount7d] = useState<EventCountType[]>([])
    const [callerCountAll, setCallerCountAll] = useState(0)
    const [currentPage, setPage] = useState(1)
    const [offset, setOffset] = useState(10)
    const [total, setTotal] = useState(0)

    async function getEventCounts7d() {
        const query = gql`
        query MyQuery {
            v1_all_event_count_7d {
                counts
                time
            }
        }`
        const res = await graphQLClient.request(query)
        setEventCount7d(res.v1_all_event_count_7d)
        // return res.v1_all_caller_count_7d
    }
    async function getEventCountAll() {
        const query = gql`
        query MyQuery {
            t_event_logs_v1_aggregate {
                aggregate {
                    count
                }
            }
        }`
        const res = await graphQLClient.request(query)
        setEventCountAll(res.t_event_logs_v1_aggregate.aggregate.count)
    }

    async function getCanisterCounts7d() {
        const query = gql`
        query MyQuery {
            v1_all_canister_count_7d {
                counts
                time
            }
        }`
        const res = await graphQLClient.request(query)
        setCanisterCount7d(res.v1_all_canister_count_7d)
        // return res.v1_all_caller_count_7d
    }
    async function getCanisterCountAll() {
        const query = gql`
        query MyQuery {
            v1_canister_event_count_7d_aggregate {
                aggregate {
                    count(columns: counts)
                }
            }
        }`
        const res = await graphQLClient.request(query)
        setCanisterCountAll(res.v1_canister_event_count_7d_aggregate.aggregate.count)
    }

    async function getCallerCounts7d() {
        const query = gql`
        query MyQuery {
            v1_all_caller_count_7d {
                counts
                time
            }
        }`
        const res = await graphQLClient.request(query)
        setCallerCount7d(res.v1_all_caller_count_7d)
        // return res.v1_all_caller_count_7d
    }
    async function getCallerCountAll() {
        const query = gql`
        query MyQuery {
            v1_all_caller_count_7d_aggregate {
                aggregate {
                    count(columns: counts)
                }
            }
        }`
        const res = await graphQLClient.request(query)
        setCallerCountAll(res.v1_all_caller_count_7d_aggregate.aggregate.count)
    }

    function changeSize(current: number, size: number) {
        console.log(current, size)
        setOffset(size)
    }
    
    async function getEventLogAll() {
        const query = gql`
        query MyQuery {
            t_event_logs_v1(order_by: {ices_time: desc}, limit: ${offset}, offset: ${offset * (currentPage - 1)}) {
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
        setLogs(res.t_event_logs_v1.map((v: LogType, i: number) => {
            v.key = i + 1
            return v
        }))
    }
    async function getLogTotal() {
        const query = gql`
        query MyQuery {
            t_event_logs_v1_aggregate {
                aggregate {
                    count
                }
            }
        }`

        const res = await graphQLClient.request(query)
        setTotal(res.t_event_logs_v1_aggregate.aggregate.count)
    }

    useEffect(() => {
        getEventLogAll()
    }, [currentPage, offset])
    useEffect(() => {
        getLogTotal()
        getEventCountAll()
        getEventCounts7d()
        getCanisterCountAll()
        getCanisterCounts7d()
        getCallerCounts7d()
        getCallerCountAll()
    }, [])

    // useEffect(() => {
    //     getAllcountsByDay()
    // }, [day])

    return (
        <>
            <Head title="ICES | Event LOG" />
            <div className="form-control w-3/4 pt-20">
                <div className="input-group">
                    <input type="text" placeholder="Search by Canister Id, Principal Id" className="input input-bordered w-full h-14 text-xl" />
                    <button className="btn btn-square h-14 w-20 bg-gray-400 border-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex justify-between space-x-10 w-full mt-20 h-52">
                <div className="card w-full h-full bg-base-100 shadow-xl">
                    <div className="card-body pb-0 pt-5">
                        <div className=" mb-0 text-gray-400 text-md">Events</div>
                        <h1 className="text-3xl font-bold my-0">{eventCountAll.toLocaleString('en-US')}</h1>
                        {eventCount7d.length > 0 && <p className="text-lg my-0 text-lime-500 flex justify-between"><span className="inline-block font-bold text-xl">+{eventCount7d[eventCount7d.length - 1].counts}</span> <i className="text-gray-300">24h</i></p>}
                        <ResponsiveContainer width="100%" height={50}>
                            <AreaChart
                                height={100}
                                data={eventCount7d}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                {/* <XAxis dataKey="time" interval={5} axisLine={false} tickLine={false} /> */}
                                <Tooltip />
                                <Area type="monotone" dataKey="counts" stroke="#82ca9d" fill="#82ca9d" />
                                {/* <Line type="monotone" dataKey="counts" stroke="#8884d8" strokeWidth={4} /> */}
                            </AreaChart>
                        </ResponsiveContainer>
                        {eventCount7d.length > 0 && <p className="flex justify-between"><span>{eventCount7d[0].time}</span><span>{eventCount7d[eventCount7d.length - 1].time}</span></p>}
                    </div>
                </div>
                <div className="card w-full h-full bg-base-100 shadow-xl">
                    <div className="card-body pb-0 pt-5">
                        <div className=" mb-0 text-gray-400 text-md">Integrated Canisters</div>
                        <h1 className="text-3xl font-bold my-0">{canisterCountAll.toLocaleString('en-US')}</h1>
                        {canisterCount7d.length > 0 && <p className="text-lg my-0 text-lime-500 flex justify-between"><span className="inline-block font-bold text-xl">+{canisterCount7d[canisterCount7d.length - 1].counts}</span> <i className="text-gray-300">24h</i></p>}
                        <ResponsiveContainer width="100%" height={50}>
                            <AreaChart
                                height={100}
                                data={canisterCount7d}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 0}}>
                                {/* <XAxis dataKey="name" interval={5} axisLine={false} tickLine={false} /> */}
                                <Tooltip />
                                <Area type="monotone" dataKey="counts" stroke="#2789f1" fill="#4ca1ea" />
                                {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={4} /> */}
                            </AreaChart>
                        </ResponsiveContainer>
                        {canisterCount7d.length > 0 && <p className="flex justify-between"><span>{canisterCount7d[0].time}</span><span>{canisterCount7d[canisterCount7d.length - 1].time}</span></p>}
                    </div>
                </div>
                <div className="card w-full h-full bg-base-100 shadow-xl">
                    <div className="card-body pb-0 pt-5">
                        <div className=" mb-0 text-gray-400 text-md">Caller</div>
                        <h1 className="text-3xl font-bold my-0">{callerCountAll.toLocaleString('en-US')}</h1>
                        {callerCount7d.length > 0 && <p className="text-lg my-0 text-lime-500 flex justify-between"><span className="inline-block font-bold text-xl">+{callerCount7d[callerCount7d.length - 1].counts}</span> <i className="text-gray-300">24h</i></p>}
                        <ResponsiveContainer width="100%" height={50}>
                            <AreaChart
                                height={100}
                                data={callerCount7d}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 0}}>
                                {/* <XAxis dataKey="name" interval={5} axisLine={false} tickLine={false} /> */}
                                <Tooltip />
                                <Area type="monotone" dataKey="counts" stroke="#f33968" fill="#f279ee" />
                                {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={4} /> */}
                            </AreaChart>
                        </ResponsiveContainer>
                        {callerCount7d.length > 0 && <p className="flex justify-between"><span>{callerCount7d[0].time}</span><span>{callerCount7d[callerCount7d.length - 1].time}</span></p>}
                    </div>
                </div>
            </div>
            <h2 className="card-title mt-20">Lates Events</h2>
            <div className="card w-full bg-base-100 shadow-xl">
                <div className="card-body">
                    <Table
                        columns={columns}
                        // rowSelection={{}}
                        expandable={{
                            expandRowByClick: true,
                            showExpandColumn: false,
                            rowExpandable: record => ['Transfer', 'Sale', 'Mint'].includes(record.type),
                            expandedRowRender: record => <p style={{ margin: 0 }}>{record.event_value}</p>,
                            // expandedRowKeys: ['event_key']
                        }}
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
                            showTotal: total => `Total ${total} items`
                        }}
                        dataSource={logs}
                    />
                </div>
                {/* <div className="flex justify-end pt-10">
                    <Pagination
                        current={currentPage}
                        total={total}
                        // itemRender={PageItem}
                        onShowSizeChange={changeSize}
                        onChange={setPage}
                        pageSizeOptions={[10, 20, 50, 100]}
                        // hideOnSinglePage={false}
                        showSizeChanger
                        showQuickJumper
                        // simple
                        showTotal={total => `Total ${total} items`}
                    />
                </div> */}
            </div>
        </>
    )
}

export default Index
