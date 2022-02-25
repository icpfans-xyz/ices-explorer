import { Head } from '~/components/shared/Head'
import { FC, useEffect, useState } from 'react'
import { GraphQLClient, gql } from 'graphql-request'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Pagination } from 'antd'
import { Link } from 'react-router-dom'
const endpoint = 'http://graph.ices.one/v1/graphql'

const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': 'df8UEfMjqN6apt',
    },
})
type LogObject = {
    id: number
    caller: string
    event_value: string
    event_key: string
    project_id: string
    time: string
    create_at: string
    timestamp: number
}

// const PageItem: FC = (page: number, type: string, originalElement ) => {
//     if (type === 'prev') {
//         return (
//             <div className="btn-group">
//                 <button className="btn btn-sm">«</button>
//             </div>
//         )
//     }
//     if (type === 'next') {
//         return (
//             <div className="btn-group">
//                 <button className="btn btn-sm">»</button>
//             </div>
//         )
//     }
//     if (type === 'page') {
//         return (
//             <div className="btn-group">
//                 <button className="btn btn-sm">{page}</button>
//             </div>
//         )
//     }
//     return originalElement
// }
const Index: FC = () => {
    const [logs, setLogs] = useState([])
    const [day, setDay] = useState(7)
    const [lineData, setLineData] = useState([])
    const [currentPage, setPage] = useState(1)
    const [offset, setOffset] = useState(10)
    const [total, setTotal] = useState(0)
    function changeSize(current: number, size: number) {
        setOffset(size)
    }
    async function getData() {
        const query = gql`
        query MyQuery {
            event_log_test(order_by: {time: desc}, limit: ${offset}, offset: ${offset * currentPage}) {
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
        setLogs(res.event_log_test)
    }
    async function getAllcountsByDay() {
        const query = gql`
        query MyQuery {
            data_day_${day}d_counts {
                counts
                time
            }
        }`

        const res = await graphQLClient.request(query)
        setLineData(res[`data_day_${day}d_counts`])
    }
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
        }`
        const res = await graphQLClient.request(query)
        setTotal(res.event_log_test_aggregate.aggregate.count)
    }
    useEffect(() => {
        getData()
    }, [currentPage, offset])
    useEffect(() => {
        getLogTotal()
    }, [])

    useEffect(() => {
        getAllcountsByDay()
    }, [day])

    return (
        <>
            <Head title="ICES | Event LOG" />
            <div className="form-control">
                <div className="input-group">
                    <input type="text" placeholder="input ProjectID or CanisterID" className="input input-bordered w-full" />
                    <button className="btn btn-square">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="shadow stats w-full mt-20">
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
                </div>
                {/* <div className="stat">
                    <div className="stat-figure text-secondary">
                        <div className="avatar online">
                            <div className="w-16 rounded-full">
                                <img src="https://api.lorem.space/image/face?w=128&h=128" />
                            </div>
                        </div>
                    </div>
                    <div className="stat-value">86%</div>
                    <div className="stat-title">Tasks done</div>
                    <div className="stat-desc text-secondary">31 tasks remaining</div>
                </div> */}
            </div>
            <div className="card bg-white w-full shadow-md mt-20">
                <div className="card-body w-full" style={{ height: 500 }}>
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
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" interval="preserveStart" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="counts" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-end space-x-3">
                        <button className="btn btn-primary" onClick={() => setDay(7)}>7d</button>
                        <button className="btn btn-primary" onClick={() => setDay(30)}>30d</button>
                        <button className="btn btn-primary" onClick={() => setDay(90)}>90d</button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto mt-20">
                <table className="table table-zebra w-full">
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
                        {
                            logs.map((v: LogObject, i) => {
                                return (
                                    <tr key={v.id}>
                                        <th>{i + 1}</th>
                                        <td><Link
                                            to={`/project/${v.project_id}`}
                                        >
                                            {v.project_id}
                                        </Link></td>
                                        <td>{v.event_key}</td>
                                        <td>{v.event_value}</td>
                                        <td><Link
                                            to={`/caller/${v.caller}`}
                                        >
                                            {v.caller}
                                        </Link></td>
                                        <td>{v.create_at}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                <div className="flex justify-end pt-10">
                    <Pagination
                        current={currentPage}
                        total={total}
                        // itemRender={PageItem}
                        onShowSizeChange={changeSize}
                        onChange={setPage}
                        pageSizeOptions={[10, 20, 50, 100]}
                        showSizeChanger
                        showQuickJumper
                        showTotal={total => `Total ${total} items`}
                    />
                </div>
            </div>
        </>
    )
}

export default Index
