import { gql } from 'graphql-request'
import {useState, useEffect } from 'react'
import {
    AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { graphQLClient } from '~/config'
import { AllMarketCardType } from './type'
import { EventCountType } from '~/components/screens/type'

export default function AllMarketCard({typeName, title, stroke, fill}: AllMarketCardType) {
    const [data, setData] = useState<EventCountType[]>([])
    // const [time, setTime] = useState('7d')
    const [count, setCount] = useState(0)
    async function getData() {
        const query = gql`
        query MyQuery {
            ${typeName}_7d {
                counts
                time
            }
        }`
        const res = await graphQLClient.request(query)
        setData(res[`${typeName}_7d`])
    }
    async function getCount() {
        const query = gql`
        query MyQuery {
            ${typeName}_all {
                counts
            }
        }`
        const res = await graphQLClient.request(query)
        setCount(res[`${typeName}_all`][0].counts)
    }
    useEffect(() => {
        getData()
        getCount()
    },[])
    return (
        <div className="w-full h-full shadow-xl card bg-base-100">
            <div className="pt-5 pb-0 card-body">
                <div className="mb-0 text-gray-400 text-md">{title}</div>
                <h1 className="my-0 text-3xl font-bold">
                    {count.toLocaleString('en-US')}
                </h1>
                {data.length > 0 && (
                    <p className="flex justify-between my-0 text-lg text-lime-500">
                        <span className="inline-block text-xl font-bold">
                            + {data[data.length - 1].counts}
                        </span>{' '}
                        <i className="text-gray-300">24h</i>
                    </p>
                )}
                <ResponsiveContainer width="100%" height={50}>
                    <AreaChart
                        height={100}
                        data={data}
                        margin={{
                            top: 1,
                            right: 0,
                            left: 0,
                            bottom: 0
                        }}>
                        {/* <XAxis dataKey="time" interval={5} axisLine={false} tickLine={false} /> */}
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="counts"
                            stroke={stroke}
                            fill={fill}
                        />
                        {/* <Line type="monotone" dataKey="counts" stroke="#8884d8" strokeWidth={4} /> */}
                    </AreaChart>
                </ResponsiveContainer>
                {data.length > 0 && (
                    <p className="flex justify-between">
                        <span>{data[0].time}</span>
                        <span>{data[data.length - 1].time}</span>
                    </p>
                )}
            </div>
        </div>
    )
}