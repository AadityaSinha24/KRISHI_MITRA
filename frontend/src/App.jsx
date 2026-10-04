
import './App.css'
import Footer from './components/Footer/Footer'
import Headers from './components/Header/Header'
// import {Dispatch} from 'react-redux'
import {Outlet} from 'react-router'

function App() {


  return (
    
    <div className='h-screen w-screen '>
      <div className='w-full block'>
        <Headers />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
    
  )
}

export default App
