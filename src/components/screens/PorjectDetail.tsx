import { FC, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { GraphQLClient, gql } from 'graphql-request'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Pagination } from 'antd'
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

const PorjectDetail: FC = () => {
    const { projectId } = useParams()
    const [logs, setLogs] = useState([])
    const [day, setDay] = useState(7)
    const [lineData, setLineData] = useState<LogObject | null>([])
    const [currentPage, setPage] = useState<number>(1)
    const [offset, setOffset] = useState<number>(10)
    const [total, setTotal] = useState<number>(0)
    function changeSize(current, size) {
        setOffset(size)
    }
    async function getData() {
        const query = gql`
        query MyQuery {
            event_log_test(order_by: {time: desc}, limit: ${offset}, offset: ${offset * currentPage}, where: {project_id: {_eq: "${projectId}"}}) {
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
            test_project_id_${day}d_count${day === 90 ? 's': ''}(where: {project_id: {_eq: "${projectId}"}}) {
                counts
                time
                project_id
            }
        }`

        const res = await graphQLClient.request(query)
        setLineData(res[`test_project_id_${day}d_count${day === 90 ? 's': ''}`])
    }
    // function pageChange(p) {
    //     console.log(p)
    // }
    async function getLogTotal() {
        const query = gql`
        query MyQuery {
            event_log_test_aggregate(where: {project_id: {_eq: "${projectId}"}}) {
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
            <Link
                className="flex items-center text-lg"
                to="/"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>Back
            </Link>
            <h1 className="text-5xl font-bold mt-8">ProjectId: {projectId}</h1>
            <div className="card w-full shadow-xl mt-20">
                <div className="card-body w-full" style={{ height: 500 }}>
                    <h2 className="card-title">Total {projectId} events / {day} day</h2>
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
                            <th>caller</th>
                            <th>create_time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            logs.map((v: LogObject, i) => {
                                return (
                                    <tr key={v.id}>
                                        <th>{i + 1}</th>
                                        <td>{v.project_id}</td>
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
        </div>
    )
}

export default PorjectDetail