import React from 'react'
import { NavLink } from 'react-router'

const Header :React.FC= () => {
  return (
    <>
       <nav>
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/about'>About</NavLink>
       </nav>
    </>
  )
}

export default Header

