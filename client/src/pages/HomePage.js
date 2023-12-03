import React, { useEffect, useState} from 'react';
import { Container, Divider, IconButton, Link, Stack, Box, TextField, Button} from '@mui/material';
import { useTheme } from '@mui/system';
import { NavLink } from 'react-router-dom';
import CustomTable from '../components/CustomTable';
import SplitButton  from '../components/SplitButton';
import SearchIcon from '@mui/icons-material/Search';
import TemporaryDrawer from '../components/TemporaryDrawer';

const config = require('../config.json');


export default function HomePage() {
  const [bookOfTheDay, setBookOfTheDay] = useState({});
  const [selectedBookTitle, setBookTitle] = useState(null);
  const [selectedBookAuthor, setBookAuthor] = useState(null);
  const [selectedBookImage, setBookImage] = useState(null)
  const [data, setData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedType, setSelectedType] = useState('title');
  const [query, setQuery] = useState('');
  const route = `http://${config.server_host}:${config.server_port}/search_bar?type=${selectedType}&keyword=${query}`;
  const theme = useTheme();

const welcomeMessageStyle = {
  display: 'flex',
  fontSize: '1em',
  color: 'black',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '6px', // Add padding for better visibility
  borderRadius: '30px', // Add rounded corners
  border: `4px solid ${theme.palette.secondary.main}`,
};

  const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '20px',
      paddingBottom: '20px',
  };

  const fullCenter = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const columnStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '10px',
    margin: '10px', // Add margin for spacing between columns
    gap: '20px',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const overlayStyle = {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the alpha value for the darkness level
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  };
  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };
  const buttonContainerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10, // Ensure the button is above the overlay
  };
  const handleSearchIconClick = () => {
    fetchData();
  };

    const fetchData = async () => {
      try {
        const response = await fetch(route);
        const result = await response.json();
        setData(result);
        setShowResults(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    useEffect(() => {
      fetch(`http://${config.server_host}:${config.server_port}/random_book`)
        .then(res => res.json())
        .then(resJson => {
          setBookOfTheDay(resJson);
          });
    }, []);

    useEffect(() => {
      setBookTitle(bookOfTheDay.title);
      setBookAuthor(bookOfTheDay.author);
      setBookImage(bookOfTheDay.image);
    }, [bookOfTheDay]);
   
    const bookColumns = [
      {
        field: 'title',
        headerName: 'Book Title',
        // renderCell: (row) => <NavLink to={`/bookpopup/${row.title}`}>{row.title}</NavLink> 
      },
      {
        field: 'author',
        headerName: 'Author'
      },
      {
        field: 'publisher',
        headerName: 'Publisher'
      },
      {
        field: 'categories',
        headerName: 'Genre'
      }
    ]

  return (
    <Container>
      <div style = {fullCenter}>
        <div imageContainerStyle>
      <img src={'https://images.pexels.com/photos/3952084/pexels-photo-3952084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} alt="Background" style={imageStyle} />
      <div style={overlayStyle}></div>
      </div>
      <div style={buttonContainerStyle}>
        <TemporaryDrawer
          selectedBookTitle={selectedBookTitle}
          selectedBookAuthor={selectedBookAuthor}
          selectedBookImage={selectedBookImage}
      />
      </div>
      </div>
      <div style = {containerStyle}></div>
      <h2>Find Your Next Read:</h2>
      <Stack direction = "row" spacing = {2} alignItems = "stretch">
        <SplitButton
          selectedType={selectedType}
          onChange={(newType) => setSelectedType(newType)}
        />
        <Box
            component="form" noValidate autoComplete="off">
           <TextField
          id="outlined-basic"
          label="Searching for..."
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
          </Box>
          <Button
                variant="contained"
                color="primary"
                onClick={handleSearchIconClick}>
                {/* style={{ height: '38px', marginBottom: '18px'}}> */}
                Search
            </Button>
          {/* <IconButton aria-label = 'search' onClick = {handleSearchIconClick}>
            <SearchIcon/>
          </IconButton> */}
      </Stack>
      <div style = {containerStyle}></div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* <h2 style={{ alignSelf: 'flex-start' }}>Search Results</h2> */}
        {showResults && (data.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <CustomTable data={data} keyColumns={bookColumns} />
        )
        )}
      </div>
      <div style = {containerStyle}></div>
    </Container>
  );
}