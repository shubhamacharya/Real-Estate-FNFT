import { React,useState } from 'react'
import './Mint.css'
import {getAxiosObj} from '../../helper/wallet'
import Header from '../Header/Header'
import pngVector from '../../assets/imgVector.png'
import axios from 'axios'
import Swal from 'sweetalert2'

function Mint() {
    const [pngImgBool,setImgBool] = useState(true)
    const [imgFile, setImgFile] = useState([]);
      
  const getMintInfo = async() => {
    let displayPic = document.getElementById('imageUpload')['files'][0]
    let urlOfDeed = document.getElementById('deedURL').value
    let price = document.getElementById('price').value
    let name = document.getElementById('name').value

    let form  = new FormData();
    let reader = new FileReader()
    reader.readAsDataURL(displayPic)
    
    form.append("img",displayPic)
    form.append("tokenURI",urlOfDeed)
    form.append("toAddress",localStorage.getItem("Owner"))
    form.append("deployerAddress",localStorage.getItem("Owner"))
    form.append("price",price)
    form.append("name",name)
    
    const res = await axios(getAxiosObj('POST','createToken',form))
    if(res.status === 200)
    {
        console.log(res);
        Swal.fire(
            'NFT Minted',
            'You clicked the button!',
            'success'
          )
    }
}
  return (
    <div>
        <Header />
        <div className='mintCotainer'>
            <div className='mintHeadContainer'>
                <header>Create new item</header>
                <span>Image, Video, Audio, or 3D Model</span>
                <h5>Upload image of property for Display here</h5>
            </div>
            <div className={pngImgBool ? 'border' : 'cross' }>
                <img className={pngImgBool ? 'defaultImg' : 'uploadedImg' } src={pngImgBool ? pngVector : imgFile} />
                <input type="file" id="imageUpload" name="imageUpload" onChange={(event) => {
                    setImgFile(URL.createObjectURL(event.target.files[0]));
                    setImgBool(false)
                }}/>
            </div>
            <div className='nftInfo'>
               <span>Name</span>
               <input type="text" id="name" required/>
               <span>URL of Deed</span>
               <input type="text" id="deedURL" required/>
               <span>Price</span>
               <input type="text" id="price" required/>
            </div>
            <div className='submitButton'>
                <button type='submit' onClick={() => {
                    getMintInfo()
                    }}>Mint</button>
            </div>
        </div>
    </div>
  )
}

export default Mint