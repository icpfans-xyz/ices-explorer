import { WhereType } from '../screens/type'

export type AllMarketCardType = {
    typeName: string;
    title: string;
    stroke?:string;
    fill?: string;
}
export type CountChartType = {
    typeName: string;
    title: string;
    color?: string;
    where?: WhereType;
}