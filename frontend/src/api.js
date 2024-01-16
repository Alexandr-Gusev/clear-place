export const ROOT_URL = `${document.location.protocol}//${document.location.hostname}`
export const API_URL = `${ROOT_URL}/api`

export const getData = async () => {
  try {
    const res = await fetch(
      `${API_URL}/get-data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: 'include'
      }
    )
    if (!res.ok) {
      return undefined
    }
    const data = await res.json()
    return data
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const updateCoords = async coords => {
  try {
    const res = await fetch(
      `${API_URL}/update-coords`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(coords),
        credentials: 'include'
      }
    )
    if (!res.ok) {
      return false
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
