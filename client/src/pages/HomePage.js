import { useEffect, useState, React } from 'react';
import { Container, Divider, IconButton, Link, Stack, Box, TextField } from '@mui/material';

// import { NavLink } from 'react-router-dom';
import LazyTable from '../components/LazyTable';
// import SongCard from '../components/SongCard';

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
        // Log the data received from the network request
        // console.log('Data received:', result);

        setData(result);
        setShowResults(true);
        // setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // setLoading(false);
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
      },
      {
        field: 'publishedDate',
        headerName: 'Date'
      }
    ]

  return (
    <Container>
      <div style = {containerStyle}>
        <h1>Book of the Day</h1>
          {selectedBookTitle === null ? (
            <p>Loading...</p>
            ) : (
            <p>Title: {selectedBookTitle}</p>
            )}
        <p>Author: {selectedBookAuthor}</p>
        <img src = {selectedBookImage}
          alt = "Book of the Day cover image"
          style = {imageStyle}
        />

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
      <Divider>  
      {showResults && (
          <div style={{ marginTop: '50px' }}>
            <h2>Search Results:</h2>
            <ul>
              {data.map((item, index) => (
                <li key={index}>
                  <strong>Title:</strong> {item.title}, <strong>Author:</strong> {item.author},{' '}
                  <strong>Publisher:</strong> {item.publisher}, <strong>Genre:</strong> {item.categories}
                </li>
              ))}
            </ul>
          </div>
      )}
      </Divider>
      </div>


      {/* <h3>Search Return</h3> */}
      {/* <LazyTable route={`http://${config.server_host}:${config.server_port}/search_bar?type=title&keyword=Who`} columns={bookColumns} 
      defaultPageSize={5} rowsPerPageOptions={[5, 10]} /> */}
      <div>
      {/* <h2>Search Results:</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <strong>Title:</strong> {item.title}, <strong>Author:</strong> {item.author},{' '}
            <strong>Publisher:</strong> {item.publisher}, <strong>Genre:</strong> {item.categories}
          </li>
        ))}
      </ul> */}
    </div>
      {/* <div>
      {data.map(item => (
        // Render your data here
        <div key={item.title}>{item.author}</div>
      ))}
    </div> */}
      {/* SongCard is a custom component that we made. selectedSongId && <SongCard .../> makes use of short-circuit logic to only render the SongCard if a non-null song is selected */}
      {/* {selectedSongId && <SongCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />}
      <h2>Check out your song of the day:&nbsp;
        <Link onClick={() => setSelectedSongId(songOfTheDay.song_id)}>{songOfTheDay.title}</Link>
      </h2>
      <Divider />
      <h2>Top Songs</h2>
      <LazyTable route={`http://${config.server_host}:${config.server_port}/top_songs`} columns={songColumns} />
      <Divider /> */}
       {/* TODO (TASK 16): add a h2 heading, LazyTable, and divider for top albums. Set the LazyTable's props for defaultPageSize to 5 and rowsPerPageOptions to [5, 10] */}
     {/* <h2>Top Albums</h2>
     <LazyTable route={`http://${config.server_host}:${config.server_port}/top_albums`} columns={albumColumns}
      defaultPageSize={5} rowsPerPageOptions={[5, 10]} />
    <Divider /> */}
      {/* TODO (TASK 17): add a paragraph (<p>text</p>) that displays the value of your author state variable from TASK 13 */}
      {/* <p>{appAuthor}</p> */}
      {/* <hr
      style={{
      marginTop : '50px',
      background: "indigo",
      height: "4px",
      width: "100%",
      border: "none",
      }}
      />
 
      <hr
        style={{
        background: "#47B5FF",
        height: "2px",
        border: "none",
      }}
        /> */}
    </Container>
    
  );
};