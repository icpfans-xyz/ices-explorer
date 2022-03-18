import { Head } from '~/components/shared/Head'
import { FC, useEffect, useState } from 'react'
import { GraphQLClient, gql } from 'graphql-request'
<<<<<<< HEAD
import { Area, AreaChart, XAxis, ResponsiveContainer } from 'recharts'
import { Table } from 'antd'
import { Link } from 'react-router-dom'
const endpoint = 'https://graph.ices.one/v1/graphql'
=======
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { Pagination } from 'antd'
import { Link } from 'react-router-dom'
import { endpoint } from 'config'
>>>>>>> 099a3cf673670bfe61b830d8359ed99849f90f68

const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': 'df8UEfMjqN6apt'
    }
})

const columns = [
    { title: 'PROJECT_ID', dataIndex: 'project_id', key: 'project_id' },
    Table.EXPAND_COLUMN,
    { title: 'EVENT_TYPE', dataIndex: 'event_key', key: 'event_key' },
    // Table.SELECTION_COLUMN,
    { title: 'EVENT_VALUE', dataIndex: 'event_value', key: 'event_value' },
    { title: 'CANISTER_ID', dataIndex: 'caller', key: 'caller', render: text => <Link to={`/canister/${text}`}>{text}</Link> },
    // Table.SELECTION_COLUMN,
    { title: 'CREATE_TIME', dataIndex: 'time', key: 'time' }
]
const Index: FC = () => {
    const [logs, setLogs] = useState([])
    // const [day, setDay] = useState(7)
    const [lineData] = useState([
        {
            name: '3-4',
            uv: 4000,
            pv: 2400,
            amt: 2400,
        },
        {
            name: 'Page B',
            uv: 3000,
            pv: 1398,
            amt: 2210,
        },
        {
            name: 'Page C',
            uv: 2000,
            pv: 9800,
            amt: 2290,
        },
        {
            name: 'Page D',
            uv: 2780,
            pv: 3908,
            amt: 2000,
        },
        {
            name: 'Page E',
            uv: 1890,
            pv: 4800,
            amt: 2181,
        },
        {
            name: 'Page F',
            uv: 2390,
            pv: 3800,
            amt: 2500,
        },
        {
            name: '3-10',
            uv: 3490,
            pv: 4300,
            amt: 2100,
        }
    ])
    const [currentPage, setPage] = useState(1)
    const [offset, setOffset] = useState(10)
    const [total, setTotal] = useState(0)
    function changeSize(current, size) {
        setOffset(size)
    }
    async function getData() {
        const query = gql`
        query MyQuery {
            event_log_test(order_by: {time: desc}, limit: ${offset}, offset: ${
            offset * currentPage
        }) {
                id
                caller
                event_value
                event_key
                project_id
                time
                create_at
                timestamp
            }
        }`

        const res = await graphQLClient.request(query)
        setLogs(res.event_log_test.map((v, i) => {
            v.key = i + 1
            return v
        }))
    }
    // async function getAllcountsByDay() {
    //     const query = gql`
    //     query MyQuery {
    //         data_day_${day}d_counts {
    //             counts
    //             time
    //         }
    //     }`

    //     const res = await graphQLClient.request(query)
    //     setLineData(res[`data_day_${day}d_counts`])
    // }
    // function pageChange(p) {
    //     console.log(p)
    // }
    async function getLogTotal() {
        const query = gql`
            query MyQuery {
                event_log_test_aggregate {
                    aggregate {
                        count
                    }
                }
            }
        `
        const res = await graphQLClient.request(query)
        setTotal(res.event_log_test_aggregate.aggregate.count)
    }
    useEffect(() => {
        getData()
    }, [currentPage, offset])
    useEffect(() => {
        getLogTotal()
    }, [])

    // useEffect(() => {
    //     getAllcountsByDay()
    // }, [day])

    return (
        <>
            <Head title="ICES | Event LOG" />
            <div className="form-control">
                <div className="input-group">
<<<<<<< HEAD
                    <input type="text" placeholder="Search by Canister Id, Principal Id" className="input input-bordered w-full h-16 text-xl" />
                    <button className="btn btn-square h-16 w-20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
=======
                    <input
                        type="text"
                        placeholder="input ProjectID or CanisterID"
                        className="w-full input input-bordered"
                    />
                    <button className="btn btn-square">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
>>>>>>> 099a3cf673670bfe61b830d8359ed99849f90f68
                        </svg>
                    </button>
                </div>
            </div>
<<<<<<< HEAD
            <div className="flex justify-between space-x-10 w-full mt-20 h-52">
                <div className="card w-full h-full bg-base-100 shadow-xl">
                    <div className="card-body pb-0 pt-5">
                        <h2 className="card-title mb-0 text-gray-400">Events</h2>
                        <h1 className="text-4xl font-bold my-0">123,123</h1>
                        <p className="text-lg my-0">+2,554 24h</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                height={100}
                                data={lineData}
                                margin={{
                                    top: 0,
                                    right: 15,
                                    left: 15,
                                    bottom: 0,
                                }}
                            >
                                <XAxis dataKey="name" interval={5} axisLine={false} tickLine={false} />
                                <Area type="monotone" dataKey="pv" stroke="#82ca9d" fill="#82ca9d" minTickGap="6" />
                                {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={4} /> */}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
=======
            <div className="w-full mt-20 shadow stats">
                <div className="stat">
                    {/* <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div> */}
                    <div className="stat-title">Total IC Events</div>
                    <div className="stat-value">{total}</div>
                    {/* <div className="stat-desc">21% more than last month</div> */}
                </div>

                <div className="stat">
                    {/* <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div> */}
                    <div className="stat-title">Total IC Project</div>
                    <div className="stat-value">2.6K</div>
                    {/* <div className="stat-desc">13% more than last month</div> */}
                </div>
                <div className="stat">
                    {/* <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div> */}
                    <div className="stat-title">Total Canister</div>
                    <div className="stat-value">3.8K</div>
                    {/* <div className="stat-desc">23% more than last month</div> */}
>>>>>>> 099a3cf673670bfe61b830d8359ed99849f90f68
                </div>
                <div className="card w-full h-full bg-base-100 shadow-xl">
                    <div className="card-body pb-0 pt-5">
                        <h2 className="card-title mb-0 text-gray-400">Integrated Canisters</h2>
                        <h1 className="text-4xl font-bold my-0">123,123</h1>
                        <p className="text-lg my-0">+2,554 24h</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                height={100}
                                data={lineData}
                                margin={{
                                    top: 0,
                                    right: 15,
                                    left: 15,
                                    bottom: 0,
                                }}
                            >
                                <XAxis dataKey="name" interval={5} axisLine={false} tickLine={false} />
                                <Area type="monotone" dataKey="pv" stroke="#abca82" fill="#4ca1ea" minTickGap="6" />
                                {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={4} /> */}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
<<<<<<< HEAD
                </div>
                <div className="card w-full h-full bg-base-100 shadow-xl">
                    <div className="card-body pb-0 pt-5">
                        <h2 className="card-title mb-0 text-gray-400">Caller</h2>
                        <h1 className="text-4xl font-bold my-0">123,123</h1>
                        <p className="text-lg my-0">+2,554 24h</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                height={100}
                                data={lineData}
                                margin={{
                                    top: 0,
                                    right: 15,
                                    left: 15,
                                    bottom: 0,
                                }}
                            >
                                <XAxis dataKey="name" interval={5} axisLine={false} tickLine={false} />
                                <Area type="monotone" dataKey="uv" stroke="#f33968" fill="#f279ee" minTickGap="6" />
                                {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={4} /> */}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="card w-full bg-base-100 mt-20 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Lates Events</h2>
                    <Table
                        columns={columns}
                        // rowSelection={{}}
                        expandable={{
                            expandRowByClick: true,
                            showExpandColumn: false,
                            rowExpandable: record => record.event_key === 'trans',
                            expandedRowRender: record => <p style={{ margin: 0 }}>{record.event_value}</p>,
                            // expandedRowKeys: ['event_key']
                        }}
                        pagination={{
                            current: currentPage,
                            total: total,
                            pageSize: 10,
                            // itemRender={PageItem}
                            onShowSizeChange: changeSize,
                            onChange: setPage,
                            pageSizeOptions: [10, 20, 50, 100],
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
=======
                    <div className="stat-value">86%</div>
                    <div className="stat-title">Tasks done</div>
                    <div className="stat-desc text-secondary">31 tasks remaining</div>
                </div> */}
            </div>
            <div className="w-full mt-20 bg-white shadow-md card">
                <div className="w-full card-body" style={{ height: 500 }}>
                    <h2 className="card-title">Total IC events / {day} day</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            width={500}
                            height={300}
                            data={lineData}
                            margin={{
                                top: 5,
                                right: 50,
                                left: 0,
                                bottom: 0
                            }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" interval="preserveStart" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="counts"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-end space-x-3">
                        <button className="btn btn-primary" onClick={() => setDay(7)}>
                            7d
                        </button>
                        <button className="btn btn-primary" onClick={() => setDay(30)}>
                            30d
                        </button>
                        <button className="btn btn-primary" onClick={() => setDay(90)}>
                            90d
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-20 overflow-x-auto">
                <table className="table w-full table-zebra">
                    <thead>
                        <tr>
                            <th />
                            <th>project_id</th>
                            <th>event_type</th>
                            <th>event_value</th>
                            <th>canister_id</th>
                            <th>create_time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((v: LogObject, i) => {
                            return (
                                <tr key={v.id}>
                                    <th>{i + 1}</th>
                                    <td>
                                        <Link to={`/project/${v.project_id}`}>{v.project_id}</Link>
                                    </td>
                                    <td>{v.event_key}</td>
                                    <td>{v.event_value}</td>
                                    <td>
                                        <Link to={`/caller/${v.caller}`}>{v.caller}</Link>
                                    </td>
                                    <td>{v.create_at}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className="flex justify-end pt-10">
>>>>>>> 099a3cf673670bfe61b830d8359ed99849f90f68
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
<<<<<<< HEAD
                        // simple
                        showTotal={total => `Total ${total} items`}
=======
                        showTotal={(total) => `Total ${total} items`}
>>>>>>> 099a3cf673670bfe61b830d8359ed99849f90f68
                    />
                </div> */}
            </div>
        </>
    )
}

export default Index
