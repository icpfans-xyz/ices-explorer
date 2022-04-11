import { Head } from '~/components/shared/Head'
import CountChart from '~/components/charts/CountChart'
export default function Analytics() {
    return (
        <>
            <Head title="ICES | Analytics" />
            <CountChart typeName="v1_all_event_count" title="Events" color="#82ca9d" />
            <CountChart typeName="v1_all_canister_count" title="Integrated Canisters" color="#2789f1" />
            <CountChart typeName="v1_all_caller_count" title="Caller" color="#f33968" />
        </>

    )
}