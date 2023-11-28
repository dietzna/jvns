import React, { useEffect, useState} from 'react';
import { Container, Divider, IconButton, Link, Stack, Box, TextField} from '@mui/material';
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
    width: '400',            // Set the width of the image
    height: 'auto',            // Maintain the aspect ratio
    boxShadow: '15px 15px 20px rgba(0, 0, 0, 0.3)',  // Add a shadow effect
    // marginBottom: '60px'
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
      <div style = {containerStyle}></div>
      <div style={welcomeMessageStyle}>
        <h2>Welcome to PageTurner</h2>
      </div>
      <div style = {containerStyle}></div>
         <div style={welcomeMessageStyle}>
          <div style={columnStyle}>
        <h2>Book of the Day</h2>
            <h4>{selectedBookTitle}</h4><h5>{selectedBookAuthor}</h5>
        <img src = {selectedBookImage}
          alt = "Book of the Day cover image"
          style = {imageStyle}
        />
        </div>
      </div>
      <div style = {containerStyle}></div>
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
          <IconButton aria-label = 'search' onClick = {handleSearchIconClick}>
            <SearchIcon/>
          </IconButton>
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
     {/* <TemporaryDrawer
        selectedBookTitle={selectedBookTitle}
        selectedBookAuthor={selectedBookAuthor}
        selectedBookImage={selectedBookImage}
      /> */}
      <div style = {containerStyle}></div>
    </Container>
  );
}