import './App.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { Sender } from '../src/components/Sender'
import {Receiver } from '../src/components/Receiver'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App