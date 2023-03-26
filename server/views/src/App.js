import './App.css';
import Home from './components/Home';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Mint from './components/Mint/Mint';
import NFTInfo from './components/NFTInfo/NFTInfo';
import MyCollection from './components/MyCollection/MyCollection';

function App() {
  
  return (
    <div className='app'>
      <Router>
        <Routes>
          <Route index path='/' element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/collection" element={<MyCollection />} />
          <Route path="/NFTInfo" element={<NFTInfo />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
