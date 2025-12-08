import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function PersonasRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to homepage (personas are now on the homepage)
    router.replace('/')
  }, [router])

  return null
}
