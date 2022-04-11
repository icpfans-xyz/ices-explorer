
import { gql, Variables } from 'graphql-request'
import {useState, useEffect } from 'react'
import {
    LineChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid,
    YAxis,
    Legend,
    Line
} from 'recharts'
import { graphQLClient } from '~/config'
import {CountChartType} from './type'

const times = ['24h', '7d', '30d', '1y']

export default function EventsChart ({typeName, title, color, where}: CountChartType) {
    const [data, setData] = useState([])
    const [time, setTime] = useState('7d')
    async function getData() {
        const query = gql`
        query MyQuery {
            ${typeName}_${time} {
                counts
                time
            }
        }`

        const whereQuery = gql`
        query MyQuery($where:${typeName}_${time}_bool_exp) {
            ${typeName}_${time}(where:$where) {
                counts
                time
            }
        }`
        const _where: Variables = {where}
        const queryParams: [string] | [string, Variables] = where !== undefined ? [query] : [whereQuery, _where]
        const res = await graphQLClient.request(...queryParams as [string, Variables])
        setData(res[`${typeName}_${time}`])
    }
    useEffect(() => {
        getData()
    },[time])
    return (
        <div className="card w-full bg-base-100 pt-10 mt-20 glass">
            <div className="flex justify-between">
                <h2 className="card-title mb-0 text-gray-600 pl-10 text-2xl">{title}</h2>
                <div className="pr-10 space-x-2">
                    {times.map(v => {
                        return <button key={v} className={`btn btn-sm ${time === v ? 'base-100' : 'btn-outline'}`} onClick={() => setTime(v)}>{v.toLocaleUpperCase()}</button>
                    })}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={450}>
                <LineChart
                    width={500}
                    height={400}
                    data={data}
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
                    <Line type="monotone" dataKey="counts" stroke={color || '#82ca9d'} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}