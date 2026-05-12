import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../store/authSlice'

const menuItems = [
  { path: '/',             icon: '📊', label: 'Dashboard'      },
  { path: '/patients',     icon: '👥', label: 'Patients'       },
  { path: '/appointments', icon: '📅', label: 'Appointments'   },
  { path: '/billing',      icon: '💰', label: 'Billing'        },
  { path: '/prescriptions',icon: '💊', label: 'Prescriptions'  },
  { path: '/lab',          icon: '🔬', label: 'Lab'            },
  { path: '/reports',      icon: '📈', label: 'Reports'        },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="w-56 min-h-screen bg-blue-900 text-white flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-5 border-b border-blue-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <div>
            <p className="font-bold text-sm">Hospital PMS</p>
            <p className="text-blue-300 text-xs">হাসপাতাল সিস্টেম</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-blue-300">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}