import { AppBar, Container, Toolbar, Typography, Box, Link } from '@mui/material'
import { NavLink } from 'react-router-dom';
import logo from './wormy.png';

function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? 'h5' : 'h7'}
      noWrap
      style={{
        marginRight: '30px',
        fontFamily: 'sans-serif',
        fontWeight: 600,
        letterSpacing: '.3rem',
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  )
}

export default function NavBar() {
  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <NavText href='/' text='PAGETURNER' isMain />
          <Link href="/">
            <Box
              component="img"
              sx={{ height: 25, ml: -4, mr: 5}}
              alt="Logo"
              src={logo}
            />
          </Link>
          <NavText href='/author' text='AUTHORS' />
          <NavText href='/users' text='USERS' />
          <NavText href='/publisher' text='PUBLISHERS' />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
