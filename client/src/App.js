import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage'
import AuthorPage from './pages/AuthorPage'
import PublisherPage from './pages/PublisherPage'
import BookInfoPage from './pages/BookInfoPage'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#008F7A',
    },
    secondary: {
      main: '#D5CABD',
  },
},
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/author" element={<AuthorPage />} />
          <Route path="/publisher" element={<PublisherPage />} />
          <Route path="/bookpopup/:title" element={<BookInfoPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
