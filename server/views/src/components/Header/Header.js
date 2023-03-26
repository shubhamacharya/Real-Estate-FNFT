import { React,useState} from 'react'
import {useNavigate} from 'react-router-dom';
import './Header.css'
import homeLogo from '../../assets/home.png'
import searchIcon from '../../assets/search.png'
import walletIcon from '../../assets/wallet.png'
import {requestAccount} from '../../helper/wallet.js'

function Header() {
    const navigate = useNavigate();
    const [walletAddress,setWalletAddress] = useState("")

    const updateAccountAddress = () => 
    {
        if(localStorage.getItem("Owner") === "")
        {
            requestAccount()
            setWalletAddress(localStorage.getItem("Owner"))
        }
        else
        {
            setWalletAddress(localStorage.getItem("Owner"))
        }
    }

    if (window.performance) {
        if (performance.navigation.type === 1) {
          requestAccount();
          //window.location.reload()
        }
    }

  return (
    <div className='header'>
        <div className='logoContainer'>
            <img src={homeLogo} className="homeLogo" onClick={() => navigate('/',{replace: true})} alt="Home Page"/>
        </div>
        <div className='searchBar'>
            <div className='searchIconContainer'>
                <img src={searchIcon} alt='searchIcon'/>
            </div>
            <input className='searchInput' placeholder='Search here...'/>
        </div>
        <div className='headerItems'>
            <button onClick={() => navigate("/mint",{replace:true})}>Mint</button>
            <button>Marketplace</button>
            <button onClick={() => {navigate("/collection")}}>My Collection</button>
        </div>
        <div className='headerActions'>
            <div className='walletConnectContainer'>
                {walletAddress === "" ? 
                <button type='button' onClick={updateAccountAddress} id='connectButton'><img src={walletIcon} alt='Connect Wallet'/></button>
                :
                <span>{walletAddress.slice(0,5)}...{walletAddress.slice(38,42)}</span>}
            </div>
        </div>
        <div className='loginButton'>Login</div>
    </div>
  )
}

export default Header