import {useState, useEffect} from 'react'
import {YMaps, Map, Placemark, Button} from '@pbe/react-yandex-maps'
import {useCookies} from 'react-cookie'
import styles from './App.module.css'
import {getCoords, updateCoords, deleteCoords} from './api.js'

/*
Бытовая канализация: 150 000 ₽ за отрезок канализации диаметром 500 мм и длиной 20 м
Ливневая канализация: 75 000 ₽ за отрезок канализации диаметром 250 мм и длиной 20 м
Дорога: 100 000 ₽ за отрезок дороги без бордюров шириной 3.5 м и длиной 20 м
Тротуар: 30 000 ₽ за отрезок тротуара без бордюров шириной 1 м и длиной 20 м
*/

const App = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [, setCookie] = useCookies(['token'])
  const [allCoords, setAllCoords] = useState([])
  const [coords, setCoords] = useState([])
  const [center, setCenter] = useState([45.074941, 39.029800])
  const zoom = 17
  const [edit, setEdit] = useState(false)

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
          <Button
            defaultOptions={{maxWidth: 200, selectOnClick: false}}
            defaultData={{content: 'Удалить свою метку'}}
            onClick={async () => {
              if (coords.length > 0) {
                await deleteCoords()
                setCoords([])
              }
              setEdit(false)
            }}
          />
          <Button
            defaultOptions={{maxWidth: 200}}
            defaultData={{content: 'Поставить свою метку'}}
            state={{selected: edit}}
            onClick={() => {
              setEdit(!edit)
            }}
          />
        </Map>
      </YMaps>
    )
}

export default App
