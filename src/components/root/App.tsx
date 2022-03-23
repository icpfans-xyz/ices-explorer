import { HelmetProvider } from 'react-helmet-async'
import Main from '~/components/root/Main'
import { withRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
// import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
// import 'antd/dist/antd.css'

export const App = () => {
    return (
        <ConfigProvider locale={enUS}>
            <HelmetProvider>
                <Main />
            </HelmetProvider>
        </ConfigProvider>
    )
}