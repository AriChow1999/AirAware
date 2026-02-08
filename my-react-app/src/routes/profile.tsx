/* routes/profile.tsx */
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import Profile from '../components/Profile'

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    const { user, isLoading } = useAuthStore.getState()

    if (!isLoading && !user) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: Profile,
})