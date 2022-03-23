import { FC, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gql } from 'graphql-request'
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
import { graphQLClient } from '~/config'

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

const PorjectDetail: FC = () => {
    const { callerId } = useParams()
    const [logs, setLogs] = useState([])
    const [day, setDay] = useState(7)
    const [lineData, setLineData] = useState([])
    const [currentPage, setPage] = useState<number>(1)
    const [offset, setOffset] = useState<number>(10)
    const [total, setTotal] = useState<number>(0)
    function changeSize(current: number, size: number) {
        setOffset(size)
    }
    async function getData() {
        const query = gql`
        query MyQuery {
            event_log_test(order_by: {time: desc}, limit: ${offset}, offset: ${
    offset * currentPage
}, where: {caller: {_eq: "${callerId}"}}) {
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
            data_day_project_${day}d_counts(where: {canister_id: {_eq: "${callerId}"}}) {
                counts
                time
            }
        }`

        const res = await graphQLClient.request(query)
        setLineData(res[`data_day_project_${day}d_counts`])
    }
    // function pageChange(p) {
    //     console.log(p)
    // }
    async function getLogTotal() {
        const query = gql`
        query MyQuery {
            event_log_test_aggregate(where: {caller: {_eq: "${callerId}"}}) {
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
        <div>
            <Link className="flex items-center text-lg" to="/">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Back
            </Link>
            <h1 className="mt-8 text-5xl font-bold">CanisterId: {callerId}</h1>
            <div className="w-full mt-20 shadow-xl card">
                <div className="w-full card-body" style={{ height: 500 }}>
                    <h2 className="card-title">Total caller events / {day} day</h2>
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
                            <th>canister_id</th>
                            <th>event_type</th>
                            <th>event_value</th>
                            <th>project_id</th>
                            <th>create_time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((v: LogObject, i) => {
                            return (
                                <tr key={v.id}>
                                    <th>{i + 1}</th>
                                    <td>{v.caller}</td>

                                    <td>{v.event_key}</td>
                                    <td>{v.event_value}</td>
                                    <td>
                                        <Link to={`/project/${v.project_id}`}>{v.project_id}</Link>
                                    </td>
                                    <td>{v.create_at}</td>
                                </tr>
                            )
                        })}
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
                        showTotal={(total) => `Total ${total} items`}
                    />
                </div>
            </div>
        </div>
    )
}

export default PorjectDetail
