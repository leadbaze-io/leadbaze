import { useEffect } from 'react'

interface CalendlyEmbedProps {
    url?: string
    prefillData?: {
        name?: string
        email?: string
        customAnswers?: Record<string, string>
    }
}

export function CalendlyEmbed({
    url = 'https://calendly.com/orafamachadoc/demonstracao-leadbaze',
    prefillData
}: CalendlyEmbedProps) {
    useEffect(() => {
        // Load Calendly widget script
        const script = document.createElement('script')
        script.src = 'https://assets.calendly.com/assets/external/widget.js'
        script.async = true
        document.body.appendChild(script)

        // Load Calendly CSS
        const link = document.createElement('link')
        link.href = 'https://assets.calendly.com/assets/external/widget.css'
        link.rel = 'stylesheet'
        document.head.appendChild(link)

        return () => {
            // Cleanup
            if (script.parentNode) {
                document.body.removeChild(script)
            }
            if (link.parentNode) {
                document.head.removeChild(link)
            }
        }
    }, [])

    const buildCalendlyUrl = () => {
        const params = new URLSearchParams()

        if (prefillData?.name) {
            params.append('name', prefillData.name)
        }
        if (prefillData?.email) {
            params.append('email', prefillData.email)
        }

        // Add custom answers if provided
        if (prefillData?.customAnswers) {
            Object.entries(prefillData.customAnswers).forEach(([key, value]) => {
                params.append(key, value)
            })
        }

        const queryString = params.toString()
        return queryString ? `${url}?${queryString}` : url
    }

    return (
        <div
            className="calendly-inline-widget"
            data-url={buildCalendlyUrl()}
            style={{
                minWidth: '320px',
                width: '100%',
                height: '700px',
                borderRadius: '12px',
                overflow: 'hidden'
            }}
        />
    )
}
