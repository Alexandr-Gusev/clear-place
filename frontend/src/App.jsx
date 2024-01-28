import {useState, useEffect} from 'react'
import {YMaps, Map, Placemark, Button as YButton} from '@pbe/react-yandex-maps'
import {useCookies} from 'react-cookie'
import Button from '@mui/material/Button'

import styles from './App.module.css'
import {getCoords, updateCoords, deleteCoords} from './api.js'
import {ConfirmDialog} from './ConfirmDialog'
import {text as manifestText} from './manifest.json'

/*
Бытовая канализация: 150 000 ₽ за отрезок канализации диаметром 500 мм и длиной 20 м
Ливневая канализация: 75 000 ₽ за отрезок канализации диаметром 250 мм и длиной 20 м
Дорога: 100 000 ₽ за отрезок дороги без бордюров шириной 3.5 м и длиной 20 м
Тротуар: 30 000 ₽ за отрезок тротуара без бордюров шириной 1 м и длиной 20 м
*/

const App = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cookies, setCookie] = useCookies(['token', 'manifest'])
  const [allCoords, setAllCoords] = useState([])
  const [coords, setCoords] = useState([])
  const [center, setCenter] = useState([45.074941, 39.029800])
  const zoom = 17
  const [edit, setEdit] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [manifest, setManifest] = useState(cookies.manifest !== 'ok')

  useEffect(() => {
    const fetch = async () => {
      const data = await getCoords()
      if (data) {
        setCookie('token', data.token, {path: '/', maxAge: 1e12})
        setAllCoords(data.allCoords)
        setCoords(data.coords)
      }
      setLoading(false)
      setError(data === undefined)
    }
    fetch()
  }, [setCookie, setAllCoords, setCoords, setLoading, setError])

  return loading || error
    ? (
      <div className={styles.splash}>
        {loading? 'Загрузка...' : 'Что-то пошло не так'}
      </div>
    )
    : (
      <YMaps query={{load: 'package.full'}}>
        <Map
          state={{
            center,
            zoom,
            controls: ['zoomControl', 'rulerControl', 'typeSelector', 'geolocationControl']
          }}
          onClick={!edit? undefined : async e => {
            const [latitude, longitude] = e.get('coords');
            await updateCoords({latitude, longitude});
            setCenter();
            setCoords([latitude, longitude]);
            setEdit(false)
          }}
          width='100%'
          height='100vh'
        >
          {coords.length > 0 && <Placemark geometry={coords} options={{iconColor: 'orange'}} />}
          {allCoords.map(({id, coords}) => <Placemark key={id} geometry={coords} options={{iconColor: 'green'}} />)}
          <YButton
            defaultOptions={{maxWidth: 200, selectOnClick: false}}
            defaultData={{content: 'Удалить свою метку'}}
            onClick={() => {
              setEdit(false)
              if (coords.length > 0) {
                setDeleteDialog(true)
              }
            }}
          />
          <YButton
            defaultOptions={{maxWidth: 200}}
            defaultData={{content: 'Поставить свою метку'}}
            state={{selected: edit}}
            onClick={() => {
              setEdit(!edit)
            }}
          />
          <YButton
            defaultOptions={{maxWidth: 200, selectOnClick: false}}
            defaultData={{content: 'Манифест'}}
            onClick={() => {
              setManifest(true)
            }}
          />
        </Map>
        <ConfirmDialog
          open={manifest}
          fullScreen
        >
          <div className={styles.manifest}>
            <h1>Соседи</h1>
            <div className={styles.manifestText}>{manifestText}</div>
            <Button variant="contained" onClick={() => {
              setCookie('manifest', 'ok', {path: '/', maxAge: 1e12})
              setManifest(false)
              setEdit(true)
            }}>
              Поставить свою метку
            </Button>
          </div>
        </ConfirmDialog>
        <ConfirmDialog
          open={deleteDialog}
          onAccept={async () => {
            setDeleteDialog(false)
            await deleteCoords()
            setCoords([])
          }}
          onCancel={() => setDeleteDialog(false)}
        >
          Вы точно хотите удалить свою метку?
        </ConfirmDialog>
      </YMaps>
    )
}

export default App
