/* routes/dashboard.tsx */
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import Dashboard from '../components/Dashboard'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const { user, isLoading } = useAuthStore.getState()

    // If verification is finished and no user is found, redirect to home
    if (!isLoading && !user) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: Dashboard,
})