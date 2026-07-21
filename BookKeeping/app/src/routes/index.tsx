import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { TodayPage } from '../pages/TodayPage'
import { StatsPage } from '../pages/StatsPage'
import { RecordFormPage } from '../pages/RecordFormPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TodayPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/records/new" element={<RecordFormPage />} />
      <Route path="/records/:id/edit" element={<RecordFormPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
