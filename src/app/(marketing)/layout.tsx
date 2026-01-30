import { Sprout } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Sprout className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Vivero SaaS</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="#features" className="hover:text-primary transition-colors">Características</Link>
                        <Link href="#pricing" className="hover:text-primary transition-colors">Precios</Link>
                        <Link href="#about" className="hover:text-primary transition-colors">Nosotros</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Entrar</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm" className="hidden sm:flex">Empezar Gratis</Button>
                        </Link>
                    </div>
                </div>
            </nav>
            <main className="pt-16">
                {children}
            </main>
            <footer className="border-t bg-muted/30 py-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© 2026 Vivero SaaS. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
