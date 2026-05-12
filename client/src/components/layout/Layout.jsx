import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-56 flex-1 p-6">
        <Outlet />
      </div>
    </div>
  )
}