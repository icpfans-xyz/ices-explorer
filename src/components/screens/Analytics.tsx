import { Head } from '~/components/shared/Head'
import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import {
    LineChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid,
    YAxis,
    Legend,
    Line
} from 'recharts'
import { graphQLClient } from '~/config'
import { useLocation } from 'react-router-dom'
export default function Analytics() {
    const [eventCount7d, setEventCount7d] = useState([])
    const [canisterCount7d, setCanisterCount7d] = useState([])
    const [callerCount7d, setCallerCount7d] = useState([])
    const { pathname } = useLocation()
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
    useEffect(() => {
        getEventCounts7d()
        getCanisterCounts7d()
        getCallerCounts7d()
    }, [])
    useEffect(() => {
        if (pathname=== '/analytics') {
            getEventCounts7d()
            getCanisterCounts7d()
            getCallerCounts7d()
        }
    }, [pathname])
    return (
        <>
            <Head title="ICES | Analytics" />
            <div className="card w-full bg-base-100 pt-10 mt-20 glass">
                <div className="flex justify-between">
                    <h2 className="card-title mb-0 text-gray-600 pl-10 text-2xl">Events</h2>
                    <div className="pr-10 space-x-2">
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
                            right: 40,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis dataKey="counts" />
                        <Tooltip />
                        <Legend />
                        {/* <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
                        <Line type="monotone" dataKey="counts" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="card w-full bg-base-100 mt-10 pt-10 glass">
                <div className="flex justify-between">
                    <h2 className="card-title mb-0 text-gray-600 pl-10 text-2xl">Integrated Canisters</h2>
                    <div className="pr-10 space-x-2">
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
                        data={canisterCount7d}
                        margin={{
                            top: 20,
                            right: 40,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis dataKey="counts" />
                        <Tooltip />
                        <Legend />
                        {/* <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
                        <Line type="monotone" dataKey="counts" stroke="#2789f1" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="card w-full bg-base-100 mt-10 pt-10 glass">
                <div className="flex justify-between">
                    <h2 className="card-title mb-0 text-gray-600 pl-10 text-2xl">Callers</h2>
                    <div className="pr-10 space-x-2">
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
                            right: 40,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis dataKey="counts" />
                        <Tooltip />
                        <Legend />
                        {/* <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
                        <Line type="monotone" dataKey="counts" stroke="#f33968" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>

    )
}