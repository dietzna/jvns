import { useEffect, useState, React } from 'react';
import { Container, Divider, IconButton, Link, Stack, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// import { NavLink } from 'react-router-dom';
import LazyTable from '../components/LazyTable';
// import SongCard from '../components/SongCard';
import CustomTable from '../components/CustomTable';
import SplitButton  from '../components/SplitButton';
import SearchIcon from '@mui/icons-material/Search';

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

  const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
  };

  const imageStyle = {
    width: '400',            // Set the width of the image
    height: 'auto',            // Maintain the aspect ratio
    boxShadow: '10px 10px 18px rgba(0, 0, 0, 0.1)',  // Add a shadow effect
    marginBottom: '60px'
  };

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/random_book`)
      .then(res => res.json())
      .then(resJson => {
        setBookOfTheDay(resJson);
        });
  }, []);

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
      setBookTitle(bookOfTheDay.title);
      setBookAuthor(bookOfTheDay.author);
      setBookImage(bookOfTheDay.image);
    }, [bookOfTheDay]);

    useEffect(() => {
      const updatedRoute = `http://${config.server_host}:${config.server_port}/search_bar?type=${selectedType}&keyword=${query}`;
      fetchData(updatedRoute);
   }, [query]);
   
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
      <div style = {containerStyle}>
        <h2>Book of the Day</h2>
            <h4>{selectedBookTitle}</h4><p>By: {selectedBookAuthor}</p>
        <img src = {selectedBookImage}
          alt = "Book of the Day cover image"
          style = {imageStyle}
        />
      </div>
      <Stack direction = "row" spacing = {2} alignItems = "stretch">
        <SplitButton
          selectedType={selectedType}
          onChange={(newType) => setSelectedType(newType)}
        />
        <Box
            component="form"
            noValidate autoComplete="off"
          >
           <TextField
          id="outlined-basic"
          label="Searching for..."
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
          </Box>
          <IconButton aria-label = 'search' onClick = {fetchData}>
            <SearchIcon/>
          </IconButton>
      </Stack>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ alignSelf: 'flex-start' }}>Search Results</h2>
        {data.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <CustomTable data={data} bookColumns={bookColumns} />
        )}
      </div>
    </Container>
  );
}