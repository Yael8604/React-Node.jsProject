import React from 'react';
import { RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router';
import './App.css';
import './styles.css';
import router from './router/router';
import { store } from './store/store';
import Home from './pages/Home';
import About from './pages/About';
import PersonalProfile from './pages/PersonalProfile';
import Exam from './pages/Exam';
import Results from './pages/Results';
import ExamInstructions from './pages/ExamInstructions';

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;