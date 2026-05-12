import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function Billing() {
  const [invoices, setInvoices] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const [formData, setFormData] = useState({
    patient: '',
    discount: 0,
    tax: 0,
    notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  })

  const [payData, setPayData] = useState({
    payment_method: 'CASH',
    paid_amount: 0,
    transaction_id: '',
  })

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { fetchInvoices() }, [filterStatus])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [invRes, patRes] = await Promise.all([
        api.get('/billing/'),
        api.get('/patients/?all=true'),
      ])
      setInvoices(invRes.data.results || [])
      setPatients(Array.isArray(patRes.data) ? patRes.data : patRes.data.results || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {}
      const res = await api.get('/billing/', { params })
      setInvoices(res.data.results || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0 }]
    })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unit_price) || 0)
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal - parseFloat(formData.discount || 0) + parseFloat(formData.tax || 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        ...formData,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
      }
      await api.post('/billing/', payload)
      setMessage('✅ Invoice created successfully!')
      setShowForm(false)
      setFormData({
        patient: '', discount: 0, tax: 0, notes: '',
        items: [{ description: '', quantity: 1, unit_price: 0 }],
      })
      fetchAll()
    } catch (err) {
      setMessage('❌ Error creating invoice. Please check all fields.')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const handlePaySubmit = async () => {
    try {
      setSaving(true)
      await api.post(`/billing/${selectedInvoice.id}/pay/`, payData)
      setMessage('✅ Payment collected successfully!')
      setShowPayModal(false)
      setSelectedInvoice(null)
      fetchAll()
    } catch (err) {
      setMessage('❌ Payment failed. Please try again.')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const printInvoice = async (id) => {
    try {
      const res = await api.get(`/billing/${id}/`)
      const inv = res.data
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${inv.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
            .hospital-name { font-size: 24px; font-weight: bold; color: #2563eb; }
            .hospital-sub { font-size: 12px; color: #666; margin-top: 4px; }
            .invoice-title { font-size: 18px; font-weight: bold; margin-top: 12px; color: #1e40af; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
            .info-label { font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
            .info-value { font-size: 14px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #2563eb; color: white; padding: 10px 14px; text-align: left; font-size: 12px; }
            td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .totals { margin-left: auto; width: 280px; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
            .total-row.grand { font-size: 16px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; border-bottom: none; }
            .status-paid { background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
            .status-pending { background: #fef9c3; color: #ca8a04; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            .payment-info { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-name">🏥 Hospital PMS</div>
            <div class="hospital-sub">হাসপাতাল ব্যবস্থাপনা সিস্টেম | Dhaka, Bangladesh</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <div class="info-label">Invoice Number</div>
              <div class="info-value" style="color:#2563eb;font-family:monospace">${inv.invoice_number}</div>
              <div class="info-label" style="margin-top:10px">Date</div>
              <div class="info-value">${new Date(inv.created_at).toLocaleDateString('en-BD', {year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Patient</div>
              <div class="info-value">${inv.patient_name}</div>
              <div class="info-label" style="margin-top:10px">Status</div>
              <span class="${inv.status === 'PAID' ? 'status-paid' : 'status-pending'}">${inv.status}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Description</th><th>Qty</th>
                <th>Unit Price (৳)</th><th>Total (৳)</th>
              </tr>
            </thead>
            <tbody>
              ${inv.items?.map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${parseFloat(item.unit_price).toLocaleString()}</td>
                  <td><strong>${parseFloat(item.total_price).toLocaleString()}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-row"><span>Subtotal</span><span>৳${parseFloat(inv.subtotal).toLocaleString()}</span></div>
            <div class="total-row"><span>Discount</span><span>- ৳${parseFloat(inv.discount).toLocaleString()}</span></div>
            <div class="total-row"><span>Tax</span><span>৳${parseFloat(inv.tax).toLocaleString()}</span></div>
            <div class="total-row grand"><span>Total</span><span>৳${parseFloat(inv.total).toLocaleString()}</span></div>
          </div>
          ${inv.status === 'PAID' ? `
          <div class="payment-info" style="margin-top:20px">
            <strong>Payment Details</strong><br/>
            Method: ${inv.payment_method || '—'} &nbsp;|&nbsp;
            Amount Paid: ৳${parseFloat(inv.paid_amount).toLocaleString()}
            ${inv.transaction_id ? `&nbsp;|&nbsp; Transaction ID: ${inv.transaction_id}` : ''}
          </div>` : ''}
          <div class="footer">
            <p>Thank you for choosing Hospital PMS</p>
            <p style="margin-top:4px">Computer-generated invoice. No signature required.</p>
            <p style="margin-top:4px">Generated: ${new Date().toLocaleString('en-BD')}</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `)
      printWindow.document.close()
    } catch (err) {
      console.error('Print error:', err)
    }
  }

  const getStatusColor = (s) => {
    switch (s) {
      case 'PAID':      return 'bg-green-100 text-green-600'
      case 'PENDING':   return 'bg-yellow-100 text-yellow-600'
      case 'PARTIAL':   return 'bg-blue-100 text-blue-600'
      case 'CANCELLED': return 'bg-red-100 text-red-600'
      default:          return 'bg-gray-100 text-gray-600'
    }
  }

  const totalRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)

  const pendingAmount = invoices
    .filter(i => i.status === 'PENDING' || i.status === 'PARTIAL')
    .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
          <p className="text-gray-500 text-sm">Manage invoices and payments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? '✕ Cancel' : '+ New Invoice'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Total Collected</p>
          <p className="text-xl font-bold text-gray-800">৳{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">Paid invoices</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">Pending Amount</p>
          <p className="text-xl font-bold text-gray-800">৳{pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-yellow-500 mt-1">Unpaid invoices</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Total Invoices</p>
          <p className="text-xl font-bold text-gray-800">{invoices.length}</p>
          <p className="text-xs text-blue-500 mt-1">All time</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.startsWith('✅')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>{message}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">New Invoice</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
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

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-600">Invoice Items *</label>
                <button type="button" onClick={addItem} className="text-blue-600 text-xs hover:underline">+ Add Item</button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Price (৳)</div>
                  <div className="col-span-1">Total</div>
                  <div className="col-span-1"></div>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-gray-100">
                    <div className="col-span-6">
                      <input value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="e.g. Consultation fee" required
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="1" value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="0" value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </div>
                    <div className="col-span-1 flex items-center text-sm text-gray-600">
                      ৳{(item.quantity * item.unit_price || 0).toLocaleString()}
                    </div>
                    <div className="col-span-1 flex items-center">
                      {formData.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discount (৳)</label>
                <input type="number" min="0" value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tax (৳)</label>
                <input type="number" min="0" value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 flex flex-col justify-center">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-blue-600">৳{calculateTotal().toLocaleString()}</p>
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
                {saving ? 'Creating...' : 'Create Invoice'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">All Invoices</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Invoice #</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total (৳)</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Paid (৳)</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-400">Loading invoices...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-8 text-gray-400">No invoices found</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-mono text-blue-600 text-xs">{inv.invoice_number}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{inv.patient_name}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">৳{parseFloat(inv.total).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">৳{parseFloat(inv.paid_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.payment_method || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(inv.created_at).toLocaleDateString('en-BD')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv)
                            setPayData({ payment_method: 'CASH', paid_amount: inv.total, transaction_id: '' })
                            setShowPayModal(true)
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition">
                          Collect Payment
                        </button>
                      )}
                      {inv.status === 'PAID' && (
                        <span className="text-green-500 text-xs font-medium">✅ Paid</span>
                      )}
                      <button onClick={() => printInvoice(inv.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                        🖨️ Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && invoices.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t">
            Total: {invoices.length} invoice(s)
          </div>
        )}
      </div>

      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Collect Payment</h2>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500">Invoice</p>
              <p className="font-mono text-blue-600 font-medium">{selectedInvoice.invoice_number}</p>
              <p className="text-xs text-gray-500 mt-1">Patient</p>
              <p className="font-medium">{selectedInvoice.patient_name}</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ৳{parseFloat(selectedInvoice.total).toLocaleString()}
                <span className="text-sm font-normal text-gray-500 ml-1">total</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Payment Method</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 'CASH',   label: 'Cash',   emoji: '💵' },
                  { value: 'BKASH',  label: 'bKash',  emoji: '📱' },
                  { value: 'NAGAD',  label: 'Nagad',  emoji: '📱' },
                  { value: 'ROCKET', label: 'Rocket', emoji: '🚀' },
                  { value: 'CARD',   label: 'Card',   emoji: '💳' },
                ].map(method => (
                  <button key={method.value} type="button"
                    onClick={() => setPayData({ ...payData, payment_method: method.value })}
                    className={`p-2 rounded-lg border text-center text-xs transition ${
                      payData.payment_method === method.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}>
                    <div className="text-lg">{method.emoji}</div>
                    <div>{method.label}</div>
                  </button>
                ))}
              </div>
            </div>
            {['BKASH', 'NAGAD', 'ROCKET'].includes(payData.payment_method) && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Transaction ID *</label>
                <input value={payData.transaction_id}
                  onChange={(e) => setPayData({ ...payData, transaction_id: e.target.value })}
                  placeholder="e.g. 8N7A3K2D1M"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            )}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount Received (৳)</label>
              <input type="number" value={payData.paid_amount}
                onChange={(e) => setPayData({ ...payData, paid_amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex gap-3">
              <button onClick={handlePaySubmit} disabled={saving}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition">
                {saving ? 'Processing...' : '✅ Confirm Payment'}
              </button>
              <button onClick={() => setShowPayModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}