import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';

export default function TemporaryDrawer({ selectedBookTitle, selectedBookAuthor, selectedBookImage }) {
  const theme = useTheme();
  const [state, setState] = React.useState({
    left: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        padding: 2,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      }}
      role="presentation"
      onClick={toggleDrawer('left', false)}
      onKeyDown={toggleDrawer('left', false)}
    >
      <div>
        <h2>Book of the Day</h2>
        <h4>
          <NavLink to={`/bookpopup/${selectedBookTitle}`} style={{ color: 'white', textDecoration: 'none' }}>
            {selectedBookTitle}
          </NavLink>
        </h4>
        <p>By: {selectedBookAuthor}</p>
        <img 
          src={selectedBookImage}
          alt="Book of the Day cover image"
          style={{ width: '100%', height: 'auto', marginBottom: '16px' }}
        />
      </div>
    </Box>
  );

  const buttonStyle = {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#d3d3d3',
    },
  };

  return (
    <div>
      <Button onClick={toggleDrawer('left', true)} sx={buttonStyle}>
        Click for Book of the Day
      </Button>
      <Drawer
        anchor="left"
        open={state['left']}
        onClose={toggleDrawer('left', false)}
      >
        {drawerContent}
      </Drawer>
    </div>
  );
}
