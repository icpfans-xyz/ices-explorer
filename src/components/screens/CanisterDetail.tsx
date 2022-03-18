import { useEffect, useState } from 'react'
import { FC, useParams, Link } from 'react-router-dom'
import { GraphQLClient, gql } from 'graphql-request'
import { Area, AreaChart, XAxis, ResponsiveContainer } from 'recharts'
import moment from 'moment'
import { Table, TreeSelect, Form, Input, DatePicker, Space, Row, Col, Button } from 'antd'
const { RangePicker } = DatePicker
const endpoint = 'http://graph.ices.one/v1/graphql'
const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': 'df8UEfMjqN6apt',
    },
})
// type LogObject = {
//     id: number
//     caller: string
//     event_value: string
//     event_key: string
//     project_id: string
//     time: string
//     create_at: string
//     timestamp: number
// }
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

const CanisterDetail: FC = () => {
    const { canisterId } = useParams()
    const [logs, setLogs] = useState([])
    // const [day, setDay] = useState(7)
    const [currentPage, setPage] = useState < number > (1)
    const [offset, setOffset] = useState < number > (10)
    const [total, setTotal] = useState < number > (0)
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

    const treeData = [{
        title: 'Transfer',
        value: 'Transfer',
        key: 'Transfer',
    }, {
        title: 'Approve',
        value: 'Approve',
        key: 'Approve',
    }, {
        title: 'Login',
        value: 'Login',
        key: 'Login',
    }
    ]
    // function changeSize(current: number, size: number) {
    //     setOffset(size)
    // }

    function changeSize(current, size) {
        setOffset(size)
    }
    
    async function getData() {
        const query = gql`
        query MyQuery {
            event_log_test(order_by: {time: desc}, limit: ${offset}, offset: ${offset * currentPage}, where: {caller: {_eq: "${canisterId}"}}) {
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
    async function getLogTotal() {
        const query = gql`
        query MyQuery {
            event_log_test_aggregate(where: {caller: {_eq: "${canisterId}"}}) {
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

    function disabledDate(current) {
        // Can not select days before today and today
        return current && current < moment().endOf('day')
    }
    // useEffect(() => {
    //     getAllcountsByDay()
    // }, [day])
    return (
        <>
            <Link
                className="flex items-center text-lg"
                to="/"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>Back
            </Link>
            <h1 className="text-4xl font-bold mt-8">CanisterId: <span className="inline-block pl-5"> {canisterId}</span></h1>
            <div className="flex justify-start space-x-10 w-full mt-20 h-52">
                <div className="card h-full bg-base-100 shadow-xl w-1/3">
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
                <div className="card w-1/3 h-full bg-base-100 shadow-xl">
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
                                <Area type="monotone" dataKey="pv" stroke="#f33968" fill="#f279ee" minTickGap="6" />
                                {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={4} /> */}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="card w-full bg-base-100 mt-20 pt-10 shadow-xl">
                <Form
                    className="pt-10"
                    name="basic"
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 10 }}
                    initialValues={{ remember: true }}
                    // onFinish={onFinish}
                    // onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Event Key"
                    >
                        <TreeSelect treeData={treeData} treeCheckable
                            showCheckedStrategy="SHOW_PARENT"
                            placeholder="Please select" />
                    </Form.Item>
                    <Form.Item label="Caller">
                        <Row>
                            <Col span={12}>
                                <Form.Item
                                    
                                    name="caller"
                                    // rules={[{ required: true, message: 'Please input your username!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12} className="pl-5">
                                <Form.Item
                                    label="Time"
                                    name="time"
                                // rules={[{ required: true, message: 'Please input your username!' }]}
                                >
                                    <Space direction="vertical" size={14}>
                                        <RangePicker disabledDate={disabledDate} />
                                    </Space>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Button type="primary" htmlType="submit">
                            Search
                            </Button>
                        </Row>
                    </Form.Item>
                </Form>
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
            </div>
        </>
    )
}

export default CanisterDetail