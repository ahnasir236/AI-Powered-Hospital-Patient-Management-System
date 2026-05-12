import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRx, setSelectedRx] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    diagnosis: '',
    advice: '',
    follow_up_date: '',
    items: [{ medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }],
  })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [rxRes, patRes, docRes] = await Promise.all([
        api.get('/prescriptions/'),
        api.get('/patients/?all=true'),
        api.get('/appointments/doctors/'),
      ])
      setPrescriptions(rxRes.data.results || [])
      setPatients(Array.isArray(patRes.data) ? patRes.data : patRes.data.results || [])
      setDoctors(docRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const addMedicine = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }]
    })
  }

  const removeMedicine = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.post('/prescriptions/', formData)
      setMessage('✅ Prescription created successfully!')
      setShowForm(false)
      setFormData({
        patient: '', doctor: '', diagnosis: '', advice: '', follow_up_date: '',
        items: [{ medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }],
      })
      fetchAll()
    } catch (err) {
      setMessage('❌ Error creating prescription. Please check all fields.')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/prescriptions/${id}/`)
      setSelectedRx(res.data)
      setShowDetail(true)
    } catch (err) {
      console.error(err)
    }
  }

  const frequencyLabel = (f) => {
    const map = { OD: 'Once daily', BD: 'Twice daily', TDS: '3x daily', QDS: '4x daily', SOS: 'When needed', STAT: 'Immediately' }
    return map[f] || f
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
          <p className="text-gray-500 text-sm">Manage patient prescriptions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? '✕ Cancel' : '+ New Prescription'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.startsWith('✅')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>{message}</div>
      )}

      {/* New Prescription Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">New Prescription</h2>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Doctor *</label>
                <select value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.full_name} — {d.department_name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Diagnosis *</label>
                <textarea value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required rows={2} placeholder="Enter diagnosis..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Advice</label>
                <textarea value={formData.advice}
                  onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                  rows={2} placeholder="Doctor's advice..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Follow-up Date</label>
                <input type="date" value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>

            {/* Medicines */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-600">Medicines *</label>
                <button type="button" onClick={addMedicine}
                  className="text-blue-600 text-xs hover:underline">+ Add Medicine</button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                  <div className="col-span-3">Medicine Name</div>
                  <div className="col-span-2">Dosage</div>
                  <div className="col-span-2">Frequency</div>
                  <div className="col-span-2">Duration</div>
                  <div className="col-span-2">Instructions</div>
                  <div className="col-span-1"></div>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-gray-100">
                    <div className="col-span-3">
                      <input value={item.medicine_name}
                        onChange={(e) => handleItemChange(index, 'medicine_name', e.target.value)}
                        placeholder="e.g. Paracetamol" required
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-2">
                      <input value={item.dosage}
                        onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                        placeholder="e.g. 500mg" required
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-2">
                      <select value={item.frequency}
                        onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="OD">Once daily</option>
                        <option value="BD">Twice daily</option>
                        <option value="TDS">3x daily</option>
                        <option value="QDS">4x daily</option>
                        <option value="SOS">When needed</option>
                        <option value="STAT">Immediately</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input value={item.duration}
                        onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                        placeholder="e.g. 5 days" required
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-2">
                      <input value={item.instructions}
                        onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                        placeholder="After meal"
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-1 flex items-center">
                      {formData.items.length > 1 && (
                        <button type="button" onClick={() => removeMedicine(index)}
                          className="text-red-400 hover:text-red-600 text-lg">×</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Create Prescription'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prescriptions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Diagnosis</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Medicines</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Follow-up</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">Loading prescriptions...</td></tr>
            ) : prescriptions.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">No prescriptions found</td></tr>
            ) : (
              prescriptions.map((rx) => (
                <tr key={rx.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{rx.patient_name}</td>
                  <td className="px-4 py-3 text-gray-600">{rx.doctor_name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{rx.diagnosis}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                      {rx.item_count} medicine(s)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {rx.follow_up_date || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(rx.created_at).toLocaleDateString('en-BD')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewDetail(rx.id)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                      View Rx
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && prescriptions.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t">
            Total: {prescriptions.length} prescription(s)
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {showDetail && selectedRx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-800">🏥 Prescription</h2>
                <p className="text-xs text-gray-400">
                  {new Date(selectedRx.created_at).toLocaleDateString('en-BD', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <button onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="p-6">
              {/* Patient & Doctor info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-semibold text-gray-800">{selectedRx.patient_name}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className="font-semibold text-gray-800">{selectedRx.doctor_name}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Diagnosis</p>
                <p className="text-gray-800 bg-gray-50 rounded-lg p-3">{selectedRx.diagnosis}</p>
              </div>

              {/* Medicines */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Medicines ({selectedRx.items?.length})
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 text-xs text-gray-500">#</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Medicine</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Dosage</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Frequency</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Duration</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500">Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRx.items?.map((item, i) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-3 py-2 font-medium text-gray-800">{item.medicine_name}</td>
                          <td className="px-3 py-2 text-gray-600">{item.dosage}</td>
                          <td className="px-3 py-2">
                            <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                              {frequencyLabel(item.frequency)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{item.duration}</td>
                          <td className="px-3 py-2 text-gray-500 text-xs">{item.instructions || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advice */}
              {selectedRx.advice && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Advice</p>
                  <p className="text-gray-700 bg-yellow-50 rounded-lg p-3 text-sm">{selectedRx.advice}</p>
                </div>
              )}

              {/* Follow-up */}
              {selectedRx.follow_up_date && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Follow-up Date</p>
                  <p className="font-semibold text-orange-600">{selectedRx.follow_up_date}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}