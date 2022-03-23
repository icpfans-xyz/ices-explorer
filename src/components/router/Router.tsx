// import { Dialog } from '@headlessui/react';
import { FC, lazy, Suspense } from 'react'
import { Outlet, RouteObject, useRoutes, BrowserRouter, Link, useLocation } from 'react-router-dom'
import logo from '../../logo_title.png'
import iclogo from '~/assets/images/dfinity.svg'
const Loading = () => <p className="p-4 w-full h-full text-center"><button className="btn loading">loading</button></p>

const IndexScreen = lazy(() => import('~/components/screens/Index'))
const Page404Screen = lazy(() => import('~/components/screens/404'))
const PorjectDetialScreen = lazy(() => import('~/components/screens/PorjectDetail'))
const CanisterDetialScreen = lazy(() => import('~/components/screens/CanisterDetail'))
const CallerDetailScreen = lazy(() => import('~/components/screens/CallerDetail'))
const AnalyticsScreen = lazy(() => import('~/components/screens/Analytics'))

const Layout: FC = () => {
    const { pathname } = useLocation()
    
    return (
        <div className="flex flex-col justify-between bg-white min-h-screen box-border">
            <div className="navbar bg-gray-100 text-primary-content h-20">
                <div className="container mx-auto flex justify-between">
                    <div className="navbar flex items-center flex-1">
                        <a href="/" className=" normal-case text-xl w-32 h-12 ">
                            <img src={logo} alt="" />
                        </a>
                        <ul className="flex space-x-5 leading-10 pl-14 my-auto items-center w-full h-full flex-1 text-xl font-bold">
                            <li><Link className={pathname === '/' ? 'text-blue-400' : 'text-gray-500'} to="/">Home</Link></li>
                            <li><Link className={pathname === '/analytics' ? 'text-blue-400' : 'text-gray-500'} to="/analytics">Analytics</Link></li>
                        </ul>
                    </div>
                    <div className="w-auto flex space-x-16">
                        {pathname !== '/' && <div className="form-control w-auto">
                            <div className="input-group w-full">
                                <input type="text" placeholder="Search by Canister Id, Principal Id" className="input input-bordered w-64" />
                                <button className="btn btn-square  bg-gray-400 border-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </button>
                            </div>
                        </div>}
                        <button className="btn gap-2">
                            <img src={iclogo} className="w-10 h-10" />
                            CONNECT
                        </button>
                    </div>
                </div>
            </div>
            <div className="container mx-auto flex-1">
                <Outlet />
            </div>
            <footer className="h-56 px-0.5 bg-gray-100 mt-20">
                <div className="h-56 container flex justify-between mx-auto">
                    <div className="flex flex-col h-full">
                        <div className="w-32 h-12 mt-7">
                            <a href="/" className=" normal-case text-xl w-32 h-12">
                                <img src={logo} alt="" />
                            </a>
                        </div>
                        <p className="mt-4">a storage and analysis service for canister`s event logs on Dfinity</p>
                        <p className="text-lg mt-12">© 2022  ICES.ONE</p>
                    </div>
                    <div className="h-full flex justify-between space-x-32 text-md text-gray-400 pt-7">
                        <dl className="flex flex-col space-y-3 justify-start">
                            <dt className="text-gray-500 text-lg">Sitemap</dt>
                            <dd>Home</dd>
                            <dd>Events</dd>
                            <dd>Canister</dd>
                            <dd>Analytics</dd>
                        </dl>
                        <dl className="flex flex-col space-y-3 justify-start">
                            <dt className="text-gray-500 text-lg">Resouces</dt>
                            <dd>Website</dd>
                            <dd>Docs</dd>
                            <dd>Github</dd>
                        </dl>
                        <dl className="flex flex-col space-y-3 justify-start">
                            <dt className="text-gray-500 text-lg">Socials</dt>
                            <dd>Twitter</dd>
                            <dd>Discord</dd>
                            <dd>Telegram</dd>
                        </dl>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export const Router: FC = () => {
    return (
        <BrowserRouter>
            <InnerRouter />
        </BrowserRouter>
    )
}

const InnerRouter: FC = () => {
    const routes: RouteObject[] = [
        {
            path: '/',
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <IndexScreen />,
                },
                {
                    path: '/analytics',
                    element: <AnalyticsScreen />
                },
                {
                    path: '/project/:projectId',
                    element: <PorjectDetialScreen />
                },
                {
                    path: '/canister/:canisterId',
                    element: <CanisterDetialScreen />
                },
                {
                    path: '/caller/:callerId',
                    element: <CallerDetailScreen />
                },
                {
                    path: '*',
                    element: <Page404Screen />,
                },
            ],
        },
    ]
    const element = useRoutes(routes)
    return (
        <div>
            <Suspense fallback={<Loading />}>{element}</Suspense>
        </div>
    )
}
