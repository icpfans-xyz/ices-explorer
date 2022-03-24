import { useEffect, useState, FC, SyntheticEvent, ChangeEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gql } from 'graphql-request'
import {
    LineChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid,
    YAxis,
    Legend,
    Line
} from 'recharts'
import moment from 'moment'
import { Table, Select, Form, Input, DatePicker, Space, Row, Col, Button } from 'antd'
import { graphQLClient } from '~/config'
import { Head } from '~/components/shared/Head'
import icrock from '~/assets/images/ic-rocks.png'
import icp123 from '~/assets/images/icp123.png'
import { LogType, EventKey, CanisterEventKey, EventKeys } from './type'
import { shortAccount } from '~/lib/util'
// import { debounce } from '~/lib/util'
const { Option } = Select
// interface EventKey {
//     canister_id: string;
//     event_key : string;
// }

const { RangePicker } = DatePicker
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

const CanisterDetail: FC = () => {
    const { canisterId } = useParams()
    const [logs, setLogs] = useState<LogType[]>([])
    const [eventCount7d, setEventCount7d] = useState([])
    const [eventCountAll, setEventCountAll] = useState(0)
    const [callerCount7d, setCallerCount7d] = useState([])
    const [callerCountAll, setCallerCountAll] = useState<number>(0)
    const [currentPage, setPage] = useState < number > (1)
    const [offset, setOffset] = useState < number > (10)
    const [total, setTotal] = useState < number > (0)
    const [eventKeys, setEventKeys] = useState<EventKeys[]>([])
    const [eventKeyPage, setEventKeyPage] = useState < number > (1)
    const [queryEventKeys, setQueryEventKeys] = useState<EventKey[]>([])
    const [orParams, setOrParams] = useState('')
    const [tabIndex, setTabIndex] = useState(0)
    function changeSize(current: number, size: number) {
        setOffset(size)
    }
    async function getEventLogAll() {
        const query = gql`
        query MyQuery {
            t_event_logs_v1(limit: 15, offset: ${(currentPage - 1) * 15}, order_by: {caller_time: desc}, where: {canister_id: {_eq: "${canisterId}"}${orParams}${andParams}}) {
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
        // const variables = {
        //     or: queryEventKeys,
        // }
        const res = await graphQLClient.request(query)

        setLogs(res.t_event_logs_v1.map((v: LogType, i: number) => {
            v.key = i + 1
            return v
        }))
    }
    // async function getLogTotal() {
    //     const query = gql`
    //     query MyQuery {
    //         event_log_test_aggregate(where: {caller: {_eq: "${canisterId}"}}) {
    //             aggregate {
    //                 count
    //             }
    //         }
    //     }`
    //     const res = await graphQLClient.request(query)
    //     setTotal(res.event_log_test_aggregate.aggregate.count)
    // }
    async function getEventCounts7d() {
        const query = gql`
        query MyQuery {
            v1_canister_event_count_7d(where: {canister_id: {_eq: "${canisterId}"}}, order_by: {time: asc}) {
                counts
                time
            }
        }`
        const res = await graphQLClient.request(query)
        setEventCount7d(res.v1_canister_event_count_7d)
        // return res.v1_all_caller_count_7d
    }
    async function getEventCountAll() {
        const query = gql`
        query MyQuery {
            t_event_logs_v1_aggregate(where: {canister_id: {_eq: "${canisterId}"}}) {
                aggregate {
                    count
                }
            }
        }`
        const res = await graphQLClient.request(query)
        setEventCountAll(res.t_event_logs_v1_aggregate.aggregate.count)
        setTotal(res.t_event_logs_v1_aggregate.aggregate.count)
    }
    async function getSearchEventCountAll() {
        const query = gql`
        query MyQuery {
            t_event_logs_v1_aggregate(where: {canister_id: {_eq: "${canisterId}"}${orParams}${andParams}}) {
                aggregate {
                    count
                }
            }
        }`
        const res = await graphQLClient.request(query)
        setTotal(res.t_event_logs_v1_aggregate.aggregate.count)
    }


    async function getCallerCounts7d() {
        const query = gql`
        query MyQuery {
            v1_canister_caller_count_7d(where: {canister_id: {_eq: "${canisterId}"}}, order_by: {time: asc}) {
                counts
                time
            }
        }`
        const res = await graphQLClient.request(query)
        setCallerCount7d(res.v1_canister_caller_count_7d)
        // return res.v1_all_caller_count_7d
    }
    async function getCallerCountAll() {
        const query = gql`
        query MyQuery {
            v1_canister_caller_count_all_aggregate(where: {canister_id: {_eq: "${canisterId}"}}) {
                aggregate {
                count
                }
            }
        }`
        const res = await graphQLClient.request(query)
        setCallerCountAll(res.v1_canister_caller_count_all_aggregate.aggregate.count)
    }

    async function getEventKeys() {
        const query = gql`
            query MyQuery {
            v1_canister_event_key_group(where: {canister_id: {_eq: "${canisterId}"}}, limit: 10, offset: ${(eventKeyPage - 1) * 10}) {
                canister_id
                event_key
            }
        }`
        const res = await graphQLClient.request(query)
        const treeData: EventKeys[] = res.v1_canister_event_key_group.map((v: CanisterEventKey) => {
            return {
                title: v.event_key,
                value: v.event_key,
                key: v.event_key
            }
        })
        if (treeData.length > 0) {
            setEventKeys([...eventKeys, ...treeData])
            setEventKeyPage(eventKeyPage + 1)
        } else {
            setEventKeyPage(eventKeyPage)
        }

    }
    const [andParams, setAndParams] = useState('')
    function inputChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.value !== '') {
            setAndParams(`,_and: {caller: {_eq: ${e.target.value}}}`)
        } else {
            setAndParams('')
        }
    }
    function handleChange(arr: string[]) {
        const keys: EventKey[] = arr.map(v => {
            return {
                event_key: {
                    _eq: v
                }
            }
        })
        setQueryEventKeys(keys)
    }
    useEffect(() => {
        getEventLogAll()
        getSearchEventCountAll()
    }, [currentPage, offset, orParams])


    // useEffect(() => {
    //     console.log(eventKeyPage)
    //     getEventKeys()
    // }, [eventKeyPage])

    function disabledDate(current: moment.Moment) {
        // Can not select days before today and today
        return current && current < moment().endOf('day')
    }
    function onScroll(e: SyntheticEvent<HTMLDivElement>) {
        if (e.currentTarget.scrollTop + e.currentTarget.offsetHeight === e.currentTarget.scrollHeight) {
            getEventKeys()
            // setEventKeyPage(eventKeyPage + 1)
            // debounce(()=> {
            //     setEventKeyPage(eventKeyPage + 1)
            // }, 500)
        }
    }
    // function changePage(page) {
    //     setPage(page)
    //     getEventLogAll()
    // }
    function queryEventLogs() {
        // let str = ''
        if (queryEventKeys.length < 1) {
            // str = ''
            setOrParams('')
        } else {
            // queryEventKeys.forEach(v => {
            //     str += JSON.stringify(v)
            // })
            setOrParams(`,_or:${JSON.stringify(queryEventKeys)}`.replace(/"/g, ''))
        }
        setPage(1)
    }

    useEffect(() => {
        // getLogTotal()
        getEventCounts7d()
        getEventCountAll()
        getCallerCounts7d()
        getCallerCountAll()
        getEventKeys()
    }, [])
    return (
        <>
            <Head title={`ICES - ${canisterId} events`} />
            <Link
                className="flex items-center text-lg py-6"
                to="/"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>Back
            </Link>
            <div className="card w-full bg-base-100 glass p-5">
                <div className="w-full flex">
                    <div className="w-auto flex-1">
                        <div className="flex text-md space-x-4 items-center leading-8">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </button>
                            <div className="text-xl text-gray-500">{canisterId}</div>
                            <button><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg></button>
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex space-x-5 pt-5">
                            <button className="flex btn btn-ghost bg-gray-200 space-x-2">
                                <img src={icrock} alt="" className="w-6 h-6" />
                                <span>ic.rocks</span>
                            </button>
                            <button className="btn btn-ghost bg-gray-200 space-x-2">
                                <img src={icp123} alt="" className="w-6 h-6" />
                                <span>D Plus</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-6">
                        <div className="card bg-base-100 glass p-5">
                            <div className="card-body p-0 w-40">
                                <h2 className="card-title mb-0 text-gray-400">Total Events</h2>
                                <h1 className="text-4xl font-bold my-0">{eventCountAll}</h1>
                                <p className="text-lg my-0 text-lime-500 flex justify-between"><span className="inline-block font-bold text-xl">+75</span> <i className="text-gray-300">24h</i></p>
                                {/* <ResponsiveContainer width="100%" height={50}>
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
                                        <Tooltip />
                                        <Area type="monotone" dataKey="counts" stroke="#82ca9d" fill="#82ca9d" />
                                    </AreaChart>
                                </ResponsiveContainer>
                                {eventCount7d.length > 0 && <p className="flex justify-between"><span>{eventCount7d[0].time}</span><span>{eventCount7d[eventCount7d.length - 1].time}</span></p>} */}
                            </div>
                        </div>
                        <div className="card bg-base-100 glass p-5">
                            <div className="card-body p-0 w-40">
                                <h2 className="card-title mb-0 text-gray-400">Total Callers</h2>
                                <h1 className="text-4xl font-bold my-0">{callerCountAll}</h1>
                                <p className="text-lg my-0 text-lime-500 flex justify-between"><span className="inline-block font-bold text-xl">+75</span> <i className="text-gray-300">24h</i></p>
                                {/* <ResponsiveContainer width="100%" height={50}>
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
                                        <Tooltip />
                                        <Area type="monotone" dataKey="counts" stroke="#82ca9d" fill="#82ca9d" />
                                    </AreaChart>
                                </ResponsiveContainer>
                                {eventCount7d.length > 0 && <p className="flex justify-between"><span>{eventCount7d[0].time}</span><span>{eventCount7d[eventCount7d.length - 1].time}</span></p>} */}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* <h1 className="text-4xl font-bold mt-8">CanisterId: <span className="inline-block pl-5"> {canisterId}</span></h1>
            <div className="flex justify-start space-x-10 w-full mt-20 h-52">
                <div className="card h-full bg-base-100 shadow-xl w-1/3">
                    <div className="card-body pb-0 pt-5">
                        <h2 className="card-title mb-0 text-gray-400">Events</h2>
                        <h1 className="text-4xl font-bold my-0">{eventCountAll}</h1>
                        {eventCount7d.length > 0 && <p className="text-lg my-0 text-lime-500">+<span className="inline-block font-bold text-xl">{eventCount7d[eventCount7d.length - 1].counts}</span> <i className="text-gray-300">24h</i></p>}
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
                                <Tooltip />
                                <Area type="monotone" dataKey="counts" stroke="#82ca9d" fill="#edfff4ed" />
                            </AreaChart>
                        </ResponsiveContainer>
                        {eventCount7d.length > 0 && <p className="flex justify-between"><span>{eventCount7d[0].time}</span><span>{eventCount7d[eventCount7d.length - 1].time}</span></p>}
                    </div>
                </div>
                <div className="card w-1/3 h-full bg-base-100 shadow-xl">
                    <div className="card-body pb-0 pt-5">
                        <h2 className="card-title mb-0 text-gray-400">Caller</h2>
                        <h1 className="text-4xl font-bold my-0">{callerCountAll}</h1>
                        {callerCount7d.length > 0 && <p className="text-lg my-0 text-lime-500">+<span className="inline-block font-bold text-xl">{callerCount7d[callerCount7d.length - 1].counts}</span> <i className="text-gray-300">24h</i></p>}
                        <ResponsiveContainer width="100%" height={50}>
                            <AreaChart
                                height={100}
                                data={callerCount7d}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 0
                                }}>
                                <Tooltip />
                                <Area type="monotone" dataKey="counts" stroke="#f33968" fill="#f279ee" />
                            </AreaChart>
                        </ResponsiveContainer>
                        {callerCount7d.length > 0 && <p className="flex justify-between"><span>{callerCount7d[0].time}</span><span>{callerCount7d[callerCount7d.length - 1].time}</span></p>}
                    </div>
                </div>
            </div> */}
            <div className="tabs my-10">
                {
                    ['Events', 'Analytics'].map((v, i) => {
                        return (
                            <a onClick={() => setTabIndex(i)} key={v} className={`tab tab-bordered ${i === tabIndex ? 'tab-active' : ''}`}>{v}</a>
                        )
                    })
                }
            </div>
            {tabIndex === 0 ? (
                <div>
                    <div className="card w-full bg-base-100 pt-10 glass">
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
                                {/* <TreeSelect treeData={eventKeys} treeCheckable
                                showCheckedStrategy="SHOW_PARENT"
                                placeholder="Please select" /> */}
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Please select event_key"
                                    // defaultValue={[]}
                                    onChange={handleChange}
                                    onPopupScroll={onScroll}
                                >
                                    {eventKeys.map((v) => {
                                        return (<Option key={v.title}>{v.title}</Option>)
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Caller">
                                <Row>
                                    <Col span={12}>
                                        <Form.Item

                                            name="caller"
                                        // rules={[{ required: true, message: 'Please input your username!' }]}
                                        >
                                            <Input onChange={inputChange} />
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
                                    <Button type="primary" htmlType="submit" onClick={queryEventLogs}>
                                        Search
                                    </Button>
                                </Row>
                            </Form.Item>
                        </Form>
                    </div>
                    <div className="card w-full bg-base-100 mt-10 glass">
                        <div className="card-body">
                            <h2 className="card-title">Events</h2>
                            <Table
                                columns={columns}
                                // rowSelection={{}}
                                expandable={{
                                    // expandRowByClick: true,
                                    showExpandColumn: false,
                                    rowExpandable: (record: LogType) => ['Transfer', 'Sale', 'Mint'].includes(record.type),
                                    expandedRowRender: (record: LogType ) => <p style={{ margin: 0 }}>{record.event_value}</p>,
                                    // expandedRowKeys: ['event_key']
                                }}
                                pagination={{
                                    current: currentPage,
                                    total,
                                    pageSize: 15,
                                    // itemRender={PageItem}
                                    onShowSizeChange: changeSize,
                                    onChange: setPage,
                                    pageSizeOptions: [15, 30, 50, 100],
                                    // hideOnSinglePage={false}
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    simple: false,
                                    // simple
                                    showTotal: () => `Total ${total} items`
                                }}
                                dataSource={logs}
                            />
                        </div>
                    </div>
                </div>
            ) : <div className="h-full">
                <div className="card w-full bg-base-100 pt-10 glass">
                    <div className="flex justify-between">
                        <h2 className="card-title mb-0 text-gray-600 pl-10 text-2xl">Events</h2>
                        <div className="pr-12 space-x-2">
                            <button className="btn btn-primary btn-sm btn-outline">24H</button>
                            <button className="btn btn-primary btn-sm">7D</button>
                            <button className="btn btn-primary btn-sm btn-outline">30D</button>
                            <button className="btn btn-primary btn-sm btn-outline">All</button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={450}>
                        <LineChart
                            width={500}
                            height={400}
                            data={eventCount7d}
                            margin={{
                                top: 20,
                                right: 50,
                                bottom: 20,
                                left: 5,
                            }}
                        >
                            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis dataKey="counts" />
                            <Tooltip />
                            <Legend />
                            {/* <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
                            <Line type="monotone" dataKey="counts" stroke="#82ca9d"  strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="card w-full bg-base-100 mt-10 pt-10 glass">
                    <div className="flex justify-between">
                        <h2 className="card-title mb-0 text-gray-600 pl-10 text-2xl">Callers</h2>
                        <div className="pr-12 space-x-2">
                            <button className="btn btn-primary btn-sm btn-outline">24H</button>
                            <button className="btn btn-primary btn-sm">7D</button>
                            <button className="btn btn-primary btn-sm btn-outline">30D</button>
                            <button className="btn btn-primary btn-sm btn-outline">All</button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={450}>
                        <LineChart
                            width={500}
                            height={400}
                            data={callerCount7d}
                            margin={{
                                top: 20,
                                right: 50,
                                bottom: 20,
                                left: 5,
                            }}
                        >
                            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis dataKey="counts" />
                            <Tooltip />
                            <Legend />
                            {/* <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
                            <Line type="monotone" dataKey="counts" stroke="#f33968"  strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>}

        </>
    )
}

export default CanisterDetail