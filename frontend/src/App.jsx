import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Dashboard from './pages/dashboard'
import Project from './pages/Project'
import Task from './pages/Task'
import Workspace from './pages/Workspace'
import Login from './pages/login'
import Register from './pages/register'
import Navbar from './components/navbar'
const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar/>
    <Routes>
      <Route path='/' element={<Dashboard/>}/>
      <Route path='/project' element={<Project/>}/>
      <Route path='/task' element={<Task/>}/>
      <Route path='/workspace' element={<Workspace/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
    </Routes>
    </div>
  )
}
export default App;