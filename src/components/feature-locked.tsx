import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import Link from "next/link"

interface FeatureLockedProps {
    title: string
    description: string
    minPlan: string
}

export function FeatureLocked({ title, description, minPlan }: FeatureLockedProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="w-full max-w-lg shadow-2xl border-primary/20 bg-muted/10 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{title} Bloqueado</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-2">
                        Esta funcionalidad no está disponible en tu plan actual.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm font-medium">
                        {description}
                    </p>
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm text-primary font-semibold">
                            Requiere Plan {minPlan} o Superior
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pt-2">
                    <Button className="w-full" disabled>
                        Contactar Ventas (Próximamente)
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
