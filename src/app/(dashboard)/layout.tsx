import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Detectar modo demo
  const isDemo = user?.email === 'demo@vivero.com'

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isDemo={isDemo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}