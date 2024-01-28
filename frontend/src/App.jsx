import {useState, useEffect} from 'react'
import {YMaps, Map, Placemark} from '@pbe/react-yandex-maps'
import {useCookies} from 'react-cookie'
import Button from '@mui/material/Button'

import styles from './App.module.css'
import {getCoords, updateCoords} from './api.js'
import {ConfirmDialog} from './ConfirmDialog'
import {text as manifestText} from './manifest.json'

/*
Бытовая канализация: 150 000 ₽ за отрезок канализации диаметром 500 мм и длиной 20 м
Ливневая канализация: 75 000 ₽ за отрезок канализации диаметром 250 мм и длиной 20 м
Дорога: 100 000 ₽ за отрезок дороги без бордюров шириной 3.5 м и длиной 20 м
Тротуар: 30 000 ₽ за отрезок тротуара без бордюров шириной 1 м и длиной 20 м
*/

const buttonStyle = backgroundColor => ({backgroundColor, '&:hover': {backgroundColor}})

const App = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cookies, setCookie] = useCookies(['token', 'manifest'])
  const [allCoords, setAllCoords] = useState([])
  const [coords, setCoords] = useState([])
  const [center, setCenter] = useState([45.074941, 39.029800])
  const zoom = 17
  const [manifest, setManifest] = useState(cookies.manifest !== 'ok')
  const [edit, setEdit] = useState(false)
  const [height, setHeight] = useState(window.innerHeight)

  useEffect(() => {
    const fetch = async () => {
      const data = await getCoords()
      if (data) {
        setCookie('token', data.token, {path: '/', maxAge: 1e12})
        setAllCoords(data.allCoords)
        setCoords(data.coords)
      }
      setError(data === undefined)
      setLoading(false)
    }
    fetch()
  }, [setCookie, setAllCoords, setCoords, setLoading, setError])

  useEffect(() => {
    const onWindowResize = () => {
      setHeight(window.innerHeight)
    }
    onWindowResize()
    window.addEventListener('resize', onWindowResize)
    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  return loading || error
    ? (
      <div className={styles.splash}>
        {loading? 'Загрузка...' : 'Что-то пошло не так'}
      </div>
    )
    : (
      <YMaps query={{load: 'package.full'}}>
        <div className={styles.map}>
          <div>
            <div className={styles.mapControlsContainer}>
              <div className={styles.mapControls}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setManifest(true)
                    setEdit(false)
                  }}
                >
                  Манифест
                </Button>
                <Button
                  sx={buttonStyle(edit? 'darkorange' : 'darkgreen')}
                  variant="contained"
                  onClick={() => {
                    setEdit(!edit)
                  }}
                >
                  Метка
                </Button>
              </div>
            </div>
            <Map
              state={{
                center,
                zoom,
                controls: ['zoomControl', 'rulerControl', 'typeSelector', 'geolocationControl']
              }}
              onClick={async e => {
                setCenter()
                if (edit) {
                  const [latitude, longitude] = e.get('coords')
                  await updateCoords({latitude, longitude})
                  setCoords([latitude, longitude])
                  setEdit(false)
                }
              }}
              width="100%"
              height={`${height}px`}
            >
              {coords.length > 0 && <Placemark geometry={coords} options={{iconColor: 'orange'}} />}
              {allCoords.map(({id, coords}) => <Placemark key={id} geometry={coords} options={{iconColor: 'green'}} />)}
            </Map>
          </div>
        </div>
        <ConfirmDialog
          open={manifest}
          fullScreen
        >
          <div className={styles.manifest}>
            <h1>Соседи</h1>
            <div className={styles.manifestText}>{manifestText}</div>
            <div className={styles.manifestControls}>
              <Button variant="contained" onClick={() => {
                setCookie('manifest', 'ok', {path: '/', maxAge: 1e12})
                setManifest(false)
                setEdit(true)
              }}>
                Поставить свою метку
              </Button>
              <Button variant="text" onClick={() => {
                setCookie('manifest', 'ok', {path: '/', maxAge: 1e12})
                setManifest(false)
              }}>
                Открыть карту
              </Button>
            </div>
          </div>
        </ConfirmDialog>
      </YMaps>
    )
}

export default App
