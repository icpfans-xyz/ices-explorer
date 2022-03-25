import { useEffect, useState, FC, SyntheticEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gql } from 'graphql-request'
import {
    LineChart, ResponsiveContainer, XAxis, CartesianGrid,
    YAxis,
    Legend,
    Line
} from 'recharts'
import moment from 'moment'
import { Table, Select, Form, DatePicker, Space, Row, Col, Button, Tag, Tooltip } from 'antd'
import { graphQLClient } from '~/config'
import { Head } from '~/components/shared/Head'
import icrock from '~/assets/images/ic-rocks.png'
// import icp123 from '~/assets/images/icp123.png'
import { LogType, CanisterEventKey, EventKeys, EventValue, WhereType } from './type'
import { shortAccount, copy } from '~/lib/util'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
// import { debounce } from '~/lib/util'
const { Option } = Select
// interface EventKey {
//     canister_id: string;
//     event_key : string;
// }

const { RangePicker } = DatePicker
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
const CanisterDetail: FC = () => {
    const { callerId } = useParams()
    const [logs, setLogs] = useState < LogType[] > ([])
    const [eventCount7d, setEventCount7d] = useState([])
    const [eventCount24H, setEventCount24H] = useState(0)
    const [eventCountAll, setEventCountAll] = useState(0)
    const [currentPage, setPage] = useState < number > (1)
    const [offset, setOffset] = useState < number > (10)
    const [total, setTotal] = useState < number > (0)
    const [eventKeys, setEventKeys] = useState < EventKeys[] > ([])
    const [eventKeyPage, setEventKeyPage] = useState < number > (1)
    const [queryEventKeys, setQueryEventKeys] = useState < string[] > ([])
    const [tabIndex, setTabIndex] = useState(0)
    // const [callerInput, setCallerInput] = useState('')
    function changeSize(current: number, size: number) {
        setOffset(size)
    }
    async function getEventLogAll() {
        const query = gql`
        query MyQuery($where:t_event_logs_v1_bool_exp, $limit:Int, $offset: Int, $order_by:[t_event_logs_v1_order_by!] ) {
            t_event_logs_v1(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
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
        const where: WhereType =  {
            caller: {
                _eq: callerId
            }
        }
        if (queryEventKeys.length > 0) {
            where._or = queryEventKeys.map(v => {
                return {
                    event_key: {
                        _eq: v
                    }
                }
            })
        }
        // if (callerInput !== '') {
        //     where._and = {
        //         caller: {
        //             _eq: callerInput
        //         }
        //     }
        // }
        const variables = {
            limit: 15,
            offset: (currentPage - 1) * 15,
            order_by:[{caller_time: 'desc'}],
            where
        }
        const res = await graphQLClient.request(query, variables)
        setLogs(res.t_event_logs_v1.map((v: LogType, i: number) => {
            v.key = i + 1
            return v
        }))
        const queryTotal = gql`
        query MyQuery($where:t_event_logs_v1_bool_exp) {
            t_event_logs_v1_aggregate(where: $where) {
                aggregate {
                    count
                }
            }
        }`
        const total = await graphQLClient.request(queryTotal, {where})
        setTotal(total.t_event_logs_v1_aggregate.aggregate.count)
    }
    async function getEventCounts7d() {
        const query = gql`
        query MyQuery {
            v1_canister_event_count_7d(where: {canister_id: {_eq: "${callerId}"}}, order_by: {time: asc}) {
                counts
                time
            }
        }`
        const res = await graphQLClient.request(query)
        setEventCount7d(res.v1_canister_event_count_7d)
    }
    async function getEventCount24H() {
        const query = gql`
        query MyQuery {
            v1_caller_event_count_7d(where: {time: {_eq: "${dayjs().subtract(24, 'hour').format('YYYY-MM-DD')}"}, caller: {_eq: "${callerId}"}}) {
                counts
            }
        }`
        const res = await graphQLClient.request(query)
        setEventCount24H(res.v1_caller_event_count_7d[0].counts)
    }
    async function getEventCountAll() {
        const query = gql`
        query MyQuery {
            t_event_logs_v1_aggregate(where: {caller: {_eq: "${callerId}"}}) {
                aggregate {
                    count
                }
            }
        }`
        const res = await graphQLClient.request(query)
        setEventCountAll(res.t_event_logs_v1_aggregate.aggregate.count)
        // setTotal(res.t_event_logs_v1_aggregate.aggregate.count)
    }
    // async function getSearchEventCountAll() {
    //     const query = gql`
    //     query MyQuery {
    //         t_event_logs_v1_aggregate(where: {canister_id: {_eq: "${callerId}"}${orParams}${andParams}}) {
    //             aggregate {
    //                 count
    //             }
    //         }
    //     }`
    //     const res = await graphQLClient.request(query)
    //     setTotal(res.t_event_logs_v1_aggregate.aggregate.count)
    // }


    // async function getCallerCounts7d() {
    //     const query = gql`
    //     query MyQuery {
    //         v1_canister_caller_count_7d(where: {canister_id: {_eq: "${callerId}"}}, order_by: {time: asc}) {
    //             counts
    //             time
    //         }
    //     }`
    //     const res = await graphQLClient.request(query)
    //     setCallerCount7d(res.v1_canister_caller_count_7d)
    // }
    // async function getCallerCountAll() {
    //     const query = gql`
    //     query MyQuery {
    //         v1_canister_caller_count_all_aggregate(where: {canister_id: {_eq: "${callerId}"}}) {
    //             aggregate {
    //             count
    //             }
    //         }
    //     }`
    //     const res = await graphQLClient.request(query)
    //     setCallerCountAll(res.v1_canister_caller_count_all_aggregate.aggregate.count)
    // }

    async function getEventKeys() {
        const query = gql`
            query MyQuery {
            v1_canister_event_key_group(where: {canister_id: {_eq: "oiwok-oqaaa-aaaah-abhra-cai"}}, limit: 10, offset: ${(eventKeyPage - 1) * 10}) {
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
    // function inputChange(e: ChangeEvent<HTMLInputElement>) {
    //     setCallerInput(e.currentTarget.value)
    // }
    function handleChange(arr: string[]) {
        setQueryEventKeys(arr)
    }
    useEffect(() => {
        getEventLogAll()
        // getSearchEventCountAll()
    }, [currentPage, offset])



    function disabledDate(current: moment.Moment) {
        // Can not select days before today and today
        return current && current < moment().endOf('day')
    }
    function onScroll(e: SyntheticEvent<HTMLDivElement>) {
        if (e.currentTarget.scrollTop + e.currentTarget.offsetHeight === e.currentTarget.scrollHeight) {
            getEventKeys()
        }
    }
    // function queryEventLogs() {
    //     // let str = ''
    //     if (queryEventKeys.length < 1) {
    //         // str = ''
    //         setOrParams('')
    //     } else {
    //         setOrParams(`,_or:${JSON.stringify(queryEventKeys)}`.replace(/"/g, ''))
    //     }
    //     setPage(1)
    // }

    useEffect(() => {
        getEventCount24H()
        getEventCounts7d()
        getEventCountAll()
        getEventKeys()
    }, [])
    return (
        <>
            <Head title={`ICES - Caller ${callerId} Details`} />
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
                            <div className="text-xl text-gray-500">{callerId}</div>
                            <Tooltip trigger="click" title="Copied!">
                                <button onClick={() => copy(callerId)}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg></button>
                            </Tooltip>
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
                        </div>
                    </div>

                    <div className="flex space-x-6">
                        <div className="card bg-base-100 glass p-5">
                            <div className="card-body p-0 w-40">
                                <h2 className="card-title mb-0 text-gray-400">Total Events</h2>
                                <h1 className="text-4xl font-bold my-0">{eventCountAll}</h1>
                                <p className="text-lg my-0 text-lime-500 flex justify-between"><span className="inline-block font-bold text-xl">+{eventCount24H}</span> <i className="text-gray-300">24h</i></p>
                            </div>
                        </div>
                        {/* <div className="card bg-base-100 glass p-5">
                            <div className="card-body p-0 w-40">
                                <h2 className="card-title mb-0 text-gray-400">Total Callers</h2>
                                <h1 className="text-4xl font-bold my-0">{callerCountAll}</h1>
                                <p className="text-lg my-0 text-lime-500 flex justify-between"><span className="inline-block font-bold text-xl">+75</span> <i className="text-gray-300">24h</i></p>
                            </div>
                        </div> */}
                    </div>
                </div>

            </div>
            <div className="tabs my-10">
                {
                    ['Events', 'Analytics'].map((v, i) => {
                        return (
                            <a onClick={() => setTabIndex(i)} key={v} className={`tab tab-bordered text-xl ${i === tabIndex ? 'tab-active' : ''}`}>{v}</a>
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
                            <Form.Item label="Time">
                                <Row>
                                    {/* <Col span={12}>
                                        <Form.Item

                                            name="caller"
                                        >
                                            <Input onChange={inputChange} />
                                        </Form.Item>
                                    </Col> */}
                                    <Col span={12}>
                                        <Form.Item
                                            name="time"
                                        >
                                            <Space direction="vertical" size={14}>
                                                <RangePicker disabledDate={disabledDate} />
                                            </Space>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Button type="primary" htmlType="submit" onClick={() => getEventLogAll()}>
                                        Search
                                    </Button>
                                </Row>
                            </Form.Item>
                        </Form>
                    </div>
                    <div className="card w-full bg-base-100 mt-10 glass">
                        <div className="card-body">
                            <Table
                                columns={columns}
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
                        <h2 className="card-title mb-0 text-gray-600 pl-10 text-xl">Events</h2>
                        <div className="pr-12 space-x-2">
                            <button className="btn btn-sm btn-outline base-200">24H</button>
                            <button className="btn btn-sm base-100">7D</button>
                            <button className="btn btn-sm btn-outline">30D</button>
                            <button className="btn btn-sm btn-outline">All</button>
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
                            {/* <Tooltip /> */}
                            <Legend />
                            {/* <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
                            <Line type="monotone" dataKey="counts" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>}
        </>
    )
}

export default CanisterDetail