import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/index'
import { useSelector } from 'react-redux'
import LoginPage from './pages/auth/LoginPage'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import PatientList from './pages/patients/PatientList'
import Appointments from './pages/appointments/Appointments'
import Billing from './pages/billing/Billing'
import Prescriptions from './pages/prescriptions/Prescriptions'
import Lab from './pages/lab/Lab'
import Reports from './pages/reports/Reports'

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  return token ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <PrivateRoute><Layout /></PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="billing" element={<Billing />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="lab" element={<Lab />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  )
}

export default App