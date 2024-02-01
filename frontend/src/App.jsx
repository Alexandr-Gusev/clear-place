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
    <h1>Манифест</h1>
    <div className={styles.manifestText}>
      Соседи, для достойной жизни всем нам нужна инфраструктура - бытовая и ливневая канализация, дороги и тротуары. Стоимость этой инфраструктуры неявно входила в стоимость участков приобретенных нами у города. Кроме того, уплачивая земельный налог, мы уже почти два раза повторно оплатили постройку этой инфраструктуры. К сожалению, инфраструктура от этого так и не появилась - город потратил наши деньги на другие цели. Поэтому в настоящий момент город не может выполнить свои обязательства. Более того, город даже не планирует выполнение своих обязательств в обозримом будущем ссылаясь на так называемые планы в которых нас никогда не было и никогда не будет. Прямо сейчас нет смысла искать причину такой позиции - это не поможет нам построить инфраструктуру. Примем это как факт и сделаем выводы относительно этих людей. Пора перестать обманывать себя и надеяться на кого-то. Никто кроме нас не будет строить необходимые нам объекты. Если мы хотим изменить ситуацию, то нужно взять дело в свои руки. Однако, объем и стоимость работ несоизмеримы с возможностями одного хозяйства. Построить инфраструктуру за разумные деньги можно только всем вместе. Мы все нуждаемся друг в друге. Если ваши соседи не проведут вдоль своих участков коммуникации, то вы просто не сможете заплатить за "крыс" и коммуникации просто не дойдут до вас. Остаться в стороне вы сможете только потеряв уважение к самому себе и продолжив жить в грязи посреди современного города.
      <h2>Предлагается</h2>
      <ul>
        <li>Создать управляющую компанию которая возьмет на себя обязательства по строительству инфраструктуры</li>
        <li>Назначить руководителем компании лицо представляющее интересы жителей территории и выступающее гарантом целевого расходования средств и качества работ</li>
        <li>Подписать договоры между компанией и каждым жителем территории согласно которым компания берет на себя обязательства по строительству инфраструктуры за счет средств внесенных жителями</li>
      </ul>
      <h2>Ориентировочный расчет стоимости инфраструктуры</h2>
      <ul>
        <li>Количество хозяйств: 400 шт</li>
        <li>Длина дорог на всей территории: 8000 м</li>
        <li>Длина дорог на одно хозяйство: 20 м</li>
        <li>Бытовая канализация: 150 000 ₽ за отрезок канализации диаметром 500 мм и длиной 20 м (если сравнивать с откачкой и вывозом стоков специальной техникой, то срок окупаемости будет от 1 года до 5 лет в зависимости от объема стоков)</li>
        <li>Ливневая канализация: 75 000 ₽ за отрезок канализации диаметром 250 мм и длиной 20 м (без нее после постройки дорог в нижних точках возникнет подтопление)</li>
        <li>Дорога: 170 000 ₽ за отрезок дороги без бордюров шириной 6 м и длиной 20 м</li>
        <li>Тротуар: 40 000 ₽ за отрезок тротуара без бордюров шириной 1.5 м и длиной 20 м (строить дорогу без тротуара как это сделано на Западно-Кругликовской - преступление)</li>
        <li>Всего на одно хозяйство: 435 000 ₽</li>
        <li>Всего на всю территорию: 174 000 000 ₽</li>
      </ul>
      <h2>Справочные материалы</h2>
      <ul>
        <li><a href="https://asfalt23.ru/">Асфальтирование</a></li>
        <li><a href="https://vodootvedeniekrd.ru/livnevaja-kanalizacija/">Канализация</a></li>
      </ul>
      <h2>Инициативу готовы поддержать <span style={{color: 'darkgreen'}}>{count} хозяйств (~{(count / 4).toFixed(2)}%)</span>. Присоединяйтесь! Отметьте свое хозяйство на карте чтобы ваши соседи видели насколько ваша улица готова к преображению. Если инициативу поддержит хотя бы половина жителей территории, то будет начата процедура создания управляющей компании.</h2>
    </div>
    <div className={styles.manifestControls}>
      <Button variant="contained" onClick={() => {
        setCookie('manifest', 'ok', {path: '/', maxAge: 1e12})
        onExit(true)
      }}>
        Поставить метку
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
