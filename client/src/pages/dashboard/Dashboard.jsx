import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../store/authSlice'

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-600">🏥 Hospital PMS</h1>
          <p className="text-xs text-gray-400">হাসপাতাল ব্যবস্থাপনা সিস্টেম</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {user?.first_name || user?.username}
            </p>
            <p className="text-xs text-blue-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Welcome back, {user?.first_name || user?.username}! 👋
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="text-xs text-green-500 mt-1">↑ Active</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Today's Appointments</p>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="text-xs text-gray-400 mt-1">Scheduled</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
            <p className="text-sm text-gray-500">Departments</p>
            <p className="text-2xl font-bold text-gray-800">5</p>
            <p className="text-xs text-gray-400 mt-1">Active</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
            <p className="text-sm text-gray-500">Doctors</p>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="text-xs text-gray-400 mt-1">On duty</p>
          </div>
        </div>

        {/* Quick info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">System Info</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-gray-500">Logged in as</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-gray-500">Role</p>
              <p className="font-medium">{user?.role}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-gray-500">API Status</p>
              <p className="font-medium text-green-600">✅ Connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}