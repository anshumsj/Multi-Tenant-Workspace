import {Routes,Route} from 'react-router-dom'
import Auth from './pages/login_register';
import Dashboard from './pages/dashboard'; 
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App;