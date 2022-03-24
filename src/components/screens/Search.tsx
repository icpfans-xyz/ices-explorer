import { Head } from '~/components/shared/Head'
import { Link } from 'react-router-dom'
export default function Search() {
    return (
        <div>
            <Head title="ICES - Search Error" />
            <Link
                className="flex items-center text-lg py-6"
                to="/"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>Back
            </Link>
            <h2>Error</h2>
            <p className="text-lg"> The search string must be a valid account ID, proposal ID, canister ID.</p>
        </div>
    )
}