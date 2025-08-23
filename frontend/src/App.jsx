import { useState } from 'react'
import './App.css'
import LiveKitModal from './components/livekitModal';

function App(){
  const [showSupport, setShowSupport] = useState(false); // ✅ fixed

  const handleSupportClick = () => {
    setShowSupport(true);
  }

  return(
    <div className='app'>
      <header className="header">
        <div className='logo'>Viola</div>
      </header>

      <main>
        <section className='Assistant'>
          <h1>Your personal assistant</h1>
        </section>

        <button className='support-button' onClick={handleSupportClick}>
          Agent
        </button>
      </main>  

      {showSupport && <LiveKitModal setShowSupport={setShowSupport}/>}
    </div>
  )
}

export default App;
