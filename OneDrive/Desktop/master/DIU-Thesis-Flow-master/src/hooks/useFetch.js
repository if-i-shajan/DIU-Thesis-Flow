import { useEffect, useState } from 'react'

export const useFetch = (fetchFn, dependencies = []) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                const result = await fetchFn()
                if (result.success) {
                    setData(result.data)
                    setError(null)
                } else {
                    setError(result.error)
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetch()
    }, dependencies)

    const refetch = async () => {
        setLoading(true)
        try {
            const result = await fetchFn()
            if (result.success) {
                setData(result.data)
                setError(null)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return { data, loading, error, refetch }
}
