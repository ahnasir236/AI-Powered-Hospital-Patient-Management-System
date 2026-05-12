import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Reports() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalPrescriptions: 0,
    totalLabOrders: 0,
    completedLabOrders: 0,
  })
  const [recentPatients, setRecentPatients] = useState([])
  const [recentInvoices, setRecentInvoices] = useState([])
  const [departmentStats, setDepartmentStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const [patRes, apptRes, invRes, rxRes, labRes, deptRes] = await Promise.all([
        api.get('/patients/?all=true'),
        api.get('/appointments/'),
        api.get('/billing/'),
        api.get('/prescriptions/'),
        api.get('/lab/orders/'),
        api.get('/appointments/departments/'),
      ])

      const patients = Array.isArray(patRes.data) ? patRes.data : patRes.data.results || []
      const appointments = apptRes.data.results || []
      const invoices = invRes.data.results || []
      const prescriptions = rxRes.data.results || []
      const labOrders = labRes.data.results || []
      const departments = deptRes.data || []

      const totalRevenue = invoices
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)

      const pendingPayments = invoices
        .filter(i => i.status === 'PENDING' || i.status === 'PARTIAL')
        .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)

      setStats({
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalInvoices: invoices.length,
        totalRevenue,
        pendingPayments,
        totalPrescriptions: prescriptions.length,
        totalLabOrders: labOrders.length,
        completedLabOrders: labOrders.filter(l => l.status === 'COMPLETED').length,
      })

      setRecentPatients(patients.slice(0, 5))
      setRecentInvoices(invoices.slice(0, 5))
      setDepartmentStats(departments)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (s) => {
    switch (s) {
      case 'PAID':    return 'bg-green-100 text-green-600'
      case 'PENDING': return 'bg-yellow-100 text-yellow-600'
      case 'PARTIAL': return 'bg-blue-100 text-blue-600'
      default:        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 text-sm">Loading reports...</div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Hospital performance overview</p>
        </div>
        <button onClick={fetchReports}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          🔄 Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Patients</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalPatients}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Appointments</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">৳{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-800">৳{stats.pendingPayments.toLocaleString()}</p>
            </div>
            <span className="text-3xl">⏳</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.totalInvoices}</p>
          <p className="text-xs text-gray-500 mt-1">Total Invoices</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{stats.totalPrescriptions}</p>
          <p className="text-xs text-gray-500 mt-1">Prescriptions</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.totalLabOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Lab Orders</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-orange-600">{stats.completedLabOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Lab Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Recent Patients</h3>
            <span className="text-xs text-gray-400">{stats.totalPatients} total</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-2 text-xs text-gray-500">ID</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Name</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">District</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Blood</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-blue-600 text-xs">{p.patient_id}</td>
                  <td className="px-4 py-2 font-medium">{p.full_name}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{p.district}</td>
                  <td className="px-4 py-2">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                      {p.blood_group || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Recent Invoices</h3>
            <span className="text-xs text-gray-400">{stats.totalInvoices} total</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-2 text-xs text-gray-500">Invoice</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Patient</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Amount</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(inv => (
                <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-blue-600 text-xs">{inv.invoice_number}</td>
                  <td className="px-4 py-2 font-medium">{inv.patient_name}</td>
                  <td className="px-4 py-2 font-medium">৳{parseFloat(inv.total).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departments */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Departments Overview</h3>
        <div className="grid grid-cols-5 gap-3">
          {departmentStats.map((dept, i) => {
            const colors = [
              'bg-blue-50 border-blue-200 text-blue-700',
              'bg-green-50 border-green-200 text-green-700',
              'bg-purple-50 border-purple-200 text-purple-700',
              'bg-orange-50 border-orange-200 text-orange-700',
              'bg-red-50 border-red-200 text-red-700',
            ]
            return (
              <div key={dept.id}
                className={`border rounded-xl p-4 text-center ${colors[i % colors.length]}`}>
                <p className="font-mono text-xs mb-1">{dept.code}</p>
                <p className="font-semibold text-sm">{dept.name}</p>
                <div className={`mt-2 text-xs px-2 py-0.5 rounded-full inline-block ${dept.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {dept.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}