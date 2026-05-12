import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    department: '',
    scheduled_at: '',
    appointment_type: 'OPD',
    symptoms: '',
    notes: '',
  })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [apptRes, patRes, docRes, deptRes] = await Promise.all([
        api.get('/appointments/'),
        api.get('/patients/'),
        api.get('/appointments/doctors/'),
        api.get('/appointments/departments/'),
      ])
      setAppointments(apptRes.data.results || [])
      setPatients(patRes.data.results || [])
      setDoctors(docRes.data || [])
      setDepartments(deptRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      const params = {}
      if (filterDate) params.date = filterDate
      if (filterStatus) params.status = filterStatus
      const res = await api.get('/appointments/', { params })
      setAppointments(res.data.results || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [filterDate, filterStatus])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.post('/appointments/', formData)
      setMessage('✅ Appointment booked successfully!')
      setShowForm(false)
      setFormData({
        patient: '', doctor: '', department: '',
        scheduled_at: '', appointment_type: 'OPD',
        symptoms: '', notes: '',
      })
      fetchAll()
    } catch (err) {
      setMessage('❌ Error booking appointment. Please check all fields.')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':   return 'bg-blue-100 text-blue-600'
      case 'CONFIRMED':   return 'bg-green-100 text-green-600'
      case 'COMPLETED':   return 'bg-gray-100 text-gray-600'
      case 'CANCELLED':   return 'bg-red-100 text-red-600'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-600'
      case 'NO_SHOW':     return 'bg-orange-100 text-orange-600'
      default:            return 'bg-gray-100 text-gray-600'
    }
  }

  const formatDateTime = (dt) => {
    if (!dt) return '—'
    const d = new Date(dt)
    return d.toLocaleString('en-BD', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-500 text-sm">Manage patient appointments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showForm ? '✕ Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.startsWith('✅')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Book Appointment Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Book New Appointment
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Patient *
                </label>
                <select name="patient" value={formData.patient}
                  onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.patient_id} — {p.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Department *
                </label>
                <select name="department" value={formData.department}
                  onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Doctor *
                </label>
                <select name="doctor" value={formData.doctor}
                  onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} — {d.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Appointment Type *
                </label>
                <select name="appointment_type" value={formData.appointment_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="OPD">Outpatient (OPD)</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Date & Time *
                </label>
                <input type="datetime-local" name="scheduled_at"
                  value={formData.scheduled_at} onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Symptoms
                </label>
                <input name="symptoms" value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="e.g. Fever, headache"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Notes
                </label>
                <textarea name="notes" value={formData.notes}
                  onChange={handleChange} rows={2}
                  placeholder="Additional notes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? 'Booking...' : 'Book Appointment'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Filter by Date</label>
          <input type="date" value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Filter by Status</label>
          <select value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => { setFilterDate(''); setFilterStatus('') }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
            Clear
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Symptoms</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">Loading appointments...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">No appointments found</td></tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.patient_name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.doctor_name}</td>
                  <td className="px-4 py-3 text-gray-600">{a.department_name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDateTime(a.scheduled_at)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                      {a.appointment_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.symptoms || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && appointments.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t">
            Total: {appointments.length} appointment(s)
          </div>
        )}
      </div>
    </div>
  )
}