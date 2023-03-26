import React from 'react'
import Header from './Header/Header'
import PunkList from './PunkList/PunkList'
import { useState,useEffect } from 'react'
import axios from 'axios'
import { getAxiosObj } from '../helper/wallet'

function Home() {
  const [listData,setListData] = useState([])
  useEffect( () => {
    const fetchData = async() => {
      setListData(await (await axios(getAxiosObj('GET','getAllNFTInfo'))).data)
    }

    fetchData()
  }, [])

  return (
    <div>
        <Header />
        {<PunkList listData={listData}/>}
    </div>
  )
}

export default Home