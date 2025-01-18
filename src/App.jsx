import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MedBlogApp from './med-blog-app';

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <MedBlogApp />
      </ThemeProvider>
    </Router>
  );
};

export default App;