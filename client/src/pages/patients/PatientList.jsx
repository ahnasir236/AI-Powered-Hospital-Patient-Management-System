import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function PatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', date_of_birth: '',
    gender: 'M', blood_group: '', phone: '',
    address: '', district: '', nid_number: '',
    emergency_contact: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Load patients
  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async (searchTerm = '') => {
    try {
      setLoading(true)
      const res = await api.get('/patients/', {
        params: searchTerm ? { search: searchTerm } : {}
      })
      setPatients(res.data.results || [])
    } catch (err) {
      console.error('Error fetching patients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    fetchPatients(e.target.value)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.post('/patients/', formData)
      setMessage('✅ Patient registered successfully!')
      setShowForm(false)
      setFormData({
        first_name: '', last_name: '', date_of_birth: '',
        gender: 'M', blood_group: '', phone: '',
        address: '', district: '', nid_number: '',
        emergency_contact: '',
      })
      fetchPatients()
    } catch (err) {
      setMessage('❌ Error saving patient. Please check all fields.')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
          <p className="text-gray-500 text-sm">Manage all registered patients</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showForm ? '✕ Cancel' : '+ Add Patient'}
        </button>
      </div>

      {/* Success/Error message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.startsWith('✅')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Add Patient Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Register New Patient
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                <input name="first_name" value={formData.first_name} onChange={handleChange}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                <input name="last_name" value={formData.last_name} onChange={handleChange}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth *</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
                <select name="blood_group" value={formData.blood_group} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                <input name="phone" value={formData.phone} onChange={handleChange}
                  required placeholder="017XXXXXXXX"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">NID Number</label>
                <input name="nid_number" value={formData.nid_number} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact</label>
                <input name="emergency_contact" value={formData.emergency_contact} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">District *</label>
                <select name="district" value={formData.district} onChange={handleChange}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select District</option>
                  {['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Rangpur','Mymensingh',
                    'Comilla','Narayanganj','Gazipur','Tangail','Jessore','Bogra'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
                <input name="address" value={formData.address} onChange={handleChange}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Register Patient'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="🔍 Search by name, phone, patient ID or NID..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Patient ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Age</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Gender</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Blood</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">District</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-400">Loading patients...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-400">No patients found</td></tr>
            ) : (
              patients.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-mono text-blue-600 text-xs">{p.patient_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.age} yrs</td>
                  <td className="px-4 py-3 text-gray-600">{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">
                      {p.blood_group || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{p.district}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && patients.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t">
            Total: {patients.length} patient(s)
          </div>
        )}
      </div>
    </div>
  )
}