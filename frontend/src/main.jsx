import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { Provider } from "react-redux";
import routes from "./routes"
import { store } from './store/store';
import './i18n';
import ToasterProvider from './components/ToasterProvider';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={routes}>

    </RouterProvider>
    <ToasterProvider />
  </Provider>
)
