import { Head } from '~/components/shared/Head'
import { FC, useEffect, useState } from 'react'
import { GraphQLClient, gql } from 'graphql-request'
import { Area, AreaChart, XAxis, ResponsiveContainer } from 'recharts'
import { Table } from 'antd'
import { Link } from 'react-router-dom'
const endpoint = 'https://graph.ices.one/v1/graphql'

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
                    <input type="text" placeholder="Search by Canister Id, Principal Id" className="input input-bordered w-full h-16 text-xl" />
                    <button className="btn btn-square h-16 w-20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
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
