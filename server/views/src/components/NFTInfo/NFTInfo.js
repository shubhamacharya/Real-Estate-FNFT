import axios from 'axios'
import { React,useState,useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Modal, Button, Card, Table } from 'react-bootstrap'
import { getAxiosObj } from '../../helper/wallet'
import Header from '../Header/Header'
import './NFTInfo.css'

function NFTInfo({show,fullscreen,onHide,id,cardImage,name,price}) {
  // const {state} = useLocation()
  // const {id,cardImage,name,price} = state
  const[NFTTokenInfo,setNFTTokenInfo] = useState([])
  var infoObj = {}
  let form  = new FormData();

  // const dropDownEventHandle = () => {
  //   var acc = document.getElementsByClassName("accordion");
  //   var i;
  //   for (i = 0; i < acc.length; i++) {
  //     acc[i].addEventListener("click", function() {
  //       this.classList.toggle("active");
      
  //       var panel = this.nextElementSibling;
  //       if (panel.style.display === "block") {
  //         panel.style.display = "none";
  //       } else {
  //         panel.style.display = "block";
  //       }
  //     });
  //   }
  // }

  useEffect(() => {
    (async () => {
      let URLSymbolOfNFT = 'getSymbolOfNFT?ownerAddress='+localStorage.getItem("Owner")
      let URLtokenURI = `getNFTTokenURI?ownerAddress=${localStorage.getItem("Owner")}&tokenId=${id}`
      let URLNFTContractAddress = `getNFTContractAddress?ownerAddress=${localStorage.getItem("Owner")}`
      let URLTotalNFTSupply = `getTotalNFTSupply?ownerAddress=${localStorage.getItem("Owner")}&tokenId=${id}`
      let URLTotalFNFTSupply = `getTotalFNFTSupply?ownerAddress=${localStorage.getItem("Owner")}&tokenId=${id}`
      
      infoObj.ownerAddress = localStorage.getItem("Owner")
      infoObj.NFTcontractAddress = (await axios(getAxiosObj('GET',URLNFTContractAddress)))['data']['data']
      infoObj.NFTSymbol = (await axios(getAxiosObj('GET',URLSymbolOfNFT)))['data']['data']
      infoObj.tokenURI = (await axios(getAxiosObj('GET',URLtokenURI)))['data']['data']
      infoObj.totalNFTSupply = (await axios(getAxiosObj('GET',URLTotalNFTSupply)))['data']['data']
      infoObj.totalFNFTSupply = (await axios(getAxiosObj('GET',URLTotalFNFTSupply)))['data']['data']
      setNFTTokenInfo(infoObj)
    })()
  }, [])

  console.log(NFTTokenInfo);
  return (
    <Modal className="my-modal" show={show} fullscreen={fullscreen} size="xl" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                {name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='moalBody'>
                    <img className='modalImage' src={`http://localhost:8080/${cardImage}`} alt='Property Image'/>
                    <Card className='modelInfo'>
                        <Card.Body>
                            <Table striped bordered hover variant="dark">
                                <tbody>
                                    <tr>
  				          	  	        <td>Token Id</td>
  				          	  	        <td className='fontLow'>{id}</td>
  				          	        </tr>
					          	    <tr>
  				          			    <td>Available R-NFT</td>
  				          			    <td>{NFTTokenInfo.forSale ? 0 : '-'} / 1 {' '}{NFTTokenInfo.NFTSymbol}</td>
  				          		    </tr>
                                    <tr>
  				          			    <td>Price</td>
  				          			    <td>{price}</td>
  				          		    </tr>
                                        <tr>
  				          			<td>R-FNFT</td>
  				          			<td>{NFTTokenInfo.totalFNFTSupply}</td>
  				          		</tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={onHide}>Close</Button>
            </Modal.Footer>
    </Modal>
    // <> 
    //   <Header />
    //   <div className='mainContainer'>
    //     <div className="split left">
    //       <div className="centered">
    //         <div className='infoName'>
    //           <span>{name}</span>
    //           <span>{NFTTokenInfo.tokenURI}</span>
    //         </div>
    //         <div className='image'>
    //           <img src={`http://localhost:8080/${cardImage}`} alt={id}></img>
    //         </div>
    //       </div>
    //     </div>
    //     <div className="split right">
    //       <div className="centered">
    //         <div className='container'>
    //           <div className='infoName detailBorder'>Details</div>
    //             <button className="accordion" onClick={dropDownEventHandle}>NFT Details</button>
    //               <div className="panel infoDetails">
		// 			          <table>
    //                   <tbody>
		// 			          	  <tr>
    // 			          	  	<td>Contract Address</td>
    // 			          	  	<td>{NFTTokenInfo.NFTcontractAddress}</td>
  	// 			          	  </tr>
  	// 			          	  <tr>
  	// 			          	  	<td>Token Id</td>
  	// 			          	  	<td className='fontLow'>{id}</td>
  	// 			          	  </tr>
		// 			          	  <tr>
  	// 			          			<td>Available</td>
  	// 			          			<td>{NFTTokenInfo.forSale ? 0 : '-'} / 1 {' '}{NFTTokenInfo.NFTSymbol}</td>
  	// 			          		</tr>
		// 			          	  <tr>
  	// 			          			<td>Owner Address</td>
  	// 			          			<td>{NFTTokenInfo.ownerAddress}</td>
  	// 			          		</tr>
		// 			          	  <tr>
  	// 			          			<td>Price</td>
  	// 			          			<td>{price}</td>
  	// 			          		</tr>
    //                   </tbody>
		// 			          </table>
    //               </div>
    //               <button className="accordion" onClick={dropDownEventHandle}>FNFT Details</button>
    //               <div className="panel infoDetails">
		// 			          <table>
    //                   <tbody>
		// 			          	  <tr>
    // 			          			<td>Contract Address</td>
    // 			          			<td></td>
  	// 			          		</tr>
  	// 			          		<tr>
  	// 			          			<td>Token Id</td>
  	// 			          			<td>{id}</td>
  	// 			          		</tr>
		// 			          	  <tr>
  	// 			          			<td>Available</td>
  	// 			          			<td>{} / {}  {async() => {
                              
    //                           }
    //                         }</td>
  	// 			          		</tr>
		// 			          	  <tr>
  	// 			          			<td>Owner Address</td>
  	// 			          			<td></td>
  	// 			          		</tr>
		// 			          	  <tr>
  	// 			          			<td>Price</td>
  	// 			          			<td>{price}</td>
  	// 			          		</tr>
    //                   </tbody>
		// 			          </table>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
        
    // </>
  )
}

export default NFTInfo
