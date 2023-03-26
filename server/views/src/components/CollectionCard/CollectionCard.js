import { React, useState } from 'react'
import weth from '../../assets/weth.png'
import NFTInfo from '../NFTInfo/NFTInfo'
import './CollectionCard.css'


function CollectionCard({id,cardImage,name,price}) {
    const [fullscreen, setFullscreen] = useState(true);
    const [modalShow, setModalShow] = useState(false);

  return (
    <div className='collectionCard'>
        <img src={`http://localhost:8080/${cardImage}`} alt=''/>
        <div className='details'>
            <div className='name'>
                {name} <div className='id'># {id}</div>
            </div>
            <div className='priceContainer'>
                <img src={weth} className="wethImage" alt=""/>
                <div className='price'>{price}</div>
            </div>
        </div>
        <div className='info'>
            <button className='infoBtn' type='button' onClick={() => setModalShow(true)}>
                Get more info
            </button>
            <NFTInfo 
                show={modalShow} 
                id={id} 
                name={name} 
                price={price} 
                cardImage={cardImage}
                fullscreen={fullscreen} 
                onHide={() => setModalShow(false)}
            />
        </div>
    </div>
  )
}

export default CollectionCard