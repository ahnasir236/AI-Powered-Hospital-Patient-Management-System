import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Lab() {
  const [orders, setOrders] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    notes: '',
    items: [{ test: '' }],
  })

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { fetchOrders() }, [filterStatus])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [ordRes, patRes, docRes, testRes] = await Promise.all([
        api.get('/lab/orders/'),
        api.get('/patients/?all=true'),
        api.get('/appointments/doctors/'),
        api.get('/lab/tests/'),
      ])
      setOrders(ordRes.data.results || [])
      setPatients(Array.isArray(patRes.data) ? patRes.data : patRes.data.results || [])
      setDoctors(docRes.data || [])
      setTests(testRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {}
      const res = await api.get('/lab/orders/', { params })
      setOrders(res.data.results || [])
    } catch (err) {
      console.error(err)
    }
  }

  const addTest = () => {
    setFormData({ ...formData, items: [...formData.items, { test: '' }] })
  }

  const removeTest = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleTestChange = (index, value) => {
    const newItems = [...formData.items]
    newItems[index].test = value
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.post('/lab/orders/', formData)
      setMessage('✅ Lab order created successfully!')
      setShowForm(false)
      setFormData({ patient: '', doctor: '', notes: '', items: [{ test: '' }] })
      fetchAll()
    } catch (err) {
      setMessage('❌ Error creating lab order.')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/lab/orders/${id}/`, { status: newStatus })
      setMessage(`✅ Status updated to ${newStatus}`)
      fetchAll()
      if (selectedOrder) {
        const res = await api.get(`/lab/orders/${id}/`)
        setSelectedOrder(res.data)
      }
    } catch (err) {
      setMessage('❌ Error updating status.')
    } finally {
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/lab/orders/${id}/`)
      setSelectedOrder(res.data)
      setShowDetail(true)
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (s) => {
    switch (s) {
      case 'ORDERED':          return 'bg-blue-100 text-blue-600'
      case 'SAMPLE_COLLECTED': return 'bg-yellow-100 text-yellow-600'
      case 'IN_PROGRESS':      return 'bg-purple-100 text-purple-600'
      case 'COMPLETED':        return 'bg-green-100 text-green-600'
      case 'CANCELLED':        return 'bg-red-100 text-red-600'
      default:                 return 'bg-gray-100 text-gray-600'
    }
  }

  const getNextStatus = (current) => {
    const flow = {
      'ORDERED': 'SAMPLE_COLLECTED',
      'SAMPLE_COLLECTED': 'IN_PROGRESS',
      'IN_PROGRESS': 'COMPLETED',
    }
    return flow[current] || null
  }

  const getNextStatusLabel = (current) => {
    const labels = {
      'ORDERED': '🧪 Collect Sample',
      'SAMPLE_COLLECTED': '🔬 Start Testing',
      'IN_PROGRESS': '✅ Mark Complete',
    }
    return labels[current] || null
  }

  // Stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lab & Diagnostics</h1>
          <p className="text-gray-500 text-sm">Manage lab orders and test results</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? '✕ Cancel' : '+ New Lab Order'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="text-xl font-bold text-gray-800">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-gray-800">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-xl font-bold text-gray-800">{completedOrders}</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.startsWith('✅')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>{message}</div>
      )}

      {/* New Lab Order Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">New Lab Order</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Patient *</label>
                <select value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.patient_id} — {p.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ordered by Doctor *</label>
                <select value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tests selection */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-600">Select Tests *</label>
                <button type="button" onClick={addTest}
                  className="text-blue-600 text-xs hover:underline">+ Add Test</button>
              </div>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select value={item.test}
                      onChange={(e) => handleTestChange(index, e.target.value)}
                      required className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">Select Test</option>
                      {tests.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.code} — {t.name} (৳{t.price})
                        </option>
                      ))}
                    </select>
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeTest(index)}
                        className="text-red-400 hover:text-red-600 text-xl">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2} placeholder="Additional notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Lab Order'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <select value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">All Orders</option>
          <option value="ORDERED">Ordered</option>
          <option value="SAMPLE_COLLECTED">Sample Collected</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order #</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tests</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">No lab orders found</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-mono text-blue-600 text-xs">{order.order_number}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{order.patient_name}</td>
                  <td className="px-4 py-3 text-gray-600">{order.doctor_name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                      {order.test_count} test(s)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.ordered_at).toLocaleDateString('en-BD')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => viewDetail(order.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                        View
                      </button>
                      {getNextStatus(order.status) && (
                        <button
                          onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                          className="bg-green-50 hover:bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                          {getNextStatusLabel(order.status)}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && orders.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t">
            Total: {orders.length} order(s)
          </div>
        )}
      </div>

      {/* Lab Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-800">🔬 Lab Order</h2>
                <p className="text-xs font-mono text-blue-600">{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-semibold">{selectedOrder.patient_name}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className="font-semibold">{selectedOrder.doctor_name}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, getNextStatus(selectedOrder.status))}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs">
                      {getNextStatusLabel(selectedOrder.status)}
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Tests ({selectedOrder.items?.length})
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Code</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Test Name</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Price</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="px-3 py-2 font-mono text-xs text-blue-600">{item.test_code}</td>
                          <td className="px-3 py-2 font-medium">{item.test_name}</td>
                          <td className="px-3 py-2 text-gray-600">৳{item.test_price}</td>
                          <td className="px-3 py-2">
                            {item.result ? (
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                item.is_abnormal ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {item.result}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}