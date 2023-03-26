import React from 'react'
import CollectionCard from '../CollectionCard/CollectionCard'
import './PunkList.css'

const PunkList = ({listData}) => {
    // console.log(listData[0]._id)
    return (
    <div className='punkList'>
        {
            listData.map(data => (
                //console.log(data._id)
                
                    <CollectionCard 
                        id={data.tokenId}
                        name={data.name}
                        cardImage={data.tokenImg}
                        price={data.price}
                        key={data._id}
                    />
            ))
        }
    </div>
  )
}

export default PunkList