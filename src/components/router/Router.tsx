// import { Dialog } from '@headlessui/react';
import { FC, lazy, Suspense } from 'react'
import { Outlet, RouteObject, useRoutes, BrowserRouter } from 'react-router-dom'
import logo from '../../logo_title.png'
const Loading = () => <p className="p-4 w-full h-full text-center"><button className="btn loading">loading</button></p>

const IndexScreen = lazy(() => import('~/components/screens/Index'))
const Page404Screen = lazy(() => import('~/components/screens/404'))
const PorjectDetialScreen = lazy(() => import('~/components/screens/PorjectDetail'))
const CanisterDetialScreen = lazy(() => import('~/components/screens/CanisterDetail'))
const CallerDetailScreen = lazy(() => import('~/components/screens/CallerDetail'))

const Layout: FC = () => {
    return (
        <div className="bg-gray-100 min-h-screen box-border pb-20">
            <div className="navbar bg-white text-primary-content h-20">
                <div className="container mx-auto">
                    <a href="/" className=" normal-case text-xl w-32 h-12">
                        <img src={logo} alt="" />
                    </a>
                </div>
            </div>
            <div className="container mx-auto pt-20">
                <Outlet />
            </div>
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
                    path:'/project/:projectId',
                    element: <PorjectDetialScreen />
                },
                {
                    path:'/canister/:canisterId',
                    element: <CanisterDetialScreen />
                },
                {
                    path:'/caller/:callerId',
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
