import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router'

const AppLayout :React.FC= () => {
  return (
    <div>
      <Header/>
      <Outlet/>
    </div>
  )
}

export default AppLayout
