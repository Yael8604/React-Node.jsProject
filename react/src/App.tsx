import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router';
import router from './router/router'
import { BrowserRouter, Routes, Route } from 'react-router';
import Home from './pages/Home';
import About from './pages/About';
import PersonalProfile from './pages/PersonalProfile';
import Exam from './pages/Exam';
import Results from './pages/Results';
import ExamInstructions from './pages/ExamInstructions';
import './styles.css';

function App() {
  return (
    <>
      <RouterProvider router ={router}/>
    </>
  );
}

export default App;
