import {useState, useEffect} from 'react'
import {YMaps, Map, Placemark} from '@pbe/react-yandex-maps'
import {useCookies} from 'react-cookie'
import Button from '@mui/material/Button'

import styles from './App.module.css'
import {getCoords, updateCoords} from './api.js'

const buttonStyle = backgroundColor => ({backgroundColor, '&:hover': {backgroundColor}})

const Splash = ({loading}) => {
  return (
    <div className={styles.splash}>
      {loading? 'Загрузка...' : 'Что-то пошло не так'}
    </div>
  )
}

const Manifest = ({count, setCookie, onExit}) => (
  <div className={styles.manifest} ref={element => element && element.scrollIntoView(true)}>
    <h1>Соседи</h1>
    <div className={styles.manifestText}>
      <h2>Для комфортной жизни всем нам требуется инфраструктура. Построить ее можно только всем вместе.</h2>
      <h2>Расчет</h2>
      <ul>
        <li>Количество участков: 400 шт</li>
        <li>Длина дорог: 8000 м</li>
        <li>Длина дорог на один участок: 20 м</li>
        <li>Бытовая канализация: 150 000 ₽ за отрезок канализации диаметром 500 мм и длиной 20 м</li>
        <li>Ливневая канализация: 75 000 ₽ за отрезок канализации диаметром 250 мм и длиной 20 м</li>
        <li>Дорога: 100 000 ₽ за отрезок дороги без бордюров шириной 3.5 м и длиной 20 м</li>
        <li>Тротуар: 30 000 ₽ за отрезок тротуара без бордюров шириной 1 м и длиной 20 м</li>
        <li>Всего на один участок: 355 000 ₽ (10 000 ₽ в месяц в течение 3-х лет)</li>
      </ul>
      <h2>Справочные материалы</h2>
      <ul>
        <li><a href="https://asfalt23.ru/">Асфальтирование</a></li>
        <li><a href="https://vodootvedeniekrd.ru/livnevaja-kanalizacija/">Канализация</a></li>
      </ul>
      <h2>Нас уже {count} человек. Присоединяйтесь. Поставьте метку на своем участке чтобы мы знали, что вы с нами.</h2>
    </div>
    <div className={styles.manifestControls}>
      <Button variant="contained" onClick={() => {
        setCookie('manifest', 'ok', {path: '/', maxAge: 1e12})
        onExit(true)
      }}>
        Поставить свою метку
      </Button>
      <Button variant="text" onClick={() => {
        setCookie('manifest', 'ok', {path: '/', maxAge: 1e12})
        onExit(false)
      }}>
        Показать карту
      </Button>
    </div>
  </div>
)

const Place = ({wantEdit, allCoords, coords, setCoords, setManifest}) => {
  const [center, setCenter] = useState([45.074941, 39.029800])
  const zoom = 17
  const [height, setHeight] = useState(window.innerHeight)
  const [edit, setEdit] = useState(wantEdit)

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

  return (
    <YMaps query={{load: 'package.full'}}>
      <div className={styles.map}>
        <div ref={element => element && element.scrollIntoView(true)}>
          <div className={styles.mapOverlay}>
            <div className={styles.mapControls}>
              <Button
                variant="contained"
                onClick={() => {
                  setManifest(true)
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
            {coords.length > 0 && <Placemark geometry={coords} options={{iconColor: edit ? 'orange' : 'green'}} />}
            {allCoords.map(({id, coords}) => <Placemark key={id} geometry={coords} options={{iconColor: 'green'}} />)}
          </Map>
        </div>
      </div>
    </YMaps>
  )
}

const App = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cookies, setCookie] = useCookies(['token', 'manifest'])
  const [allCoords, setAllCoords] = useState([])
  const [coords, setCoords] = useState([])
  const [manifest, setManifest] = useState(cookies.manifest !== 'ok')
  const [wantEdit, setWantEdit] = useState(false)

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

  if (loading || error) {
    return <Splash loading={loading} />
  }

  if (manifest) {
    return (
      <Manifest
        count={allCoords.length + (coords.length > 0 ? 1 : 0)}
        setCookie={setCookie}
        onExit={value => {
          setWantEdit(value)
          setManifest(false)
        }}
      />
    )
  }

  return <Place wantEdit={wantEdit} allCoords={allCoords} coords={coords} setCoords={setCoords} setManifest={setManifest} />
}

export default App
