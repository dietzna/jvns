import { useEffect, useState } from 'react';
import { InputLabel, MenuItem, FormControl, Select, TextField, Button} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import StaticTable from '../components/StaticTable';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
const config = require('../config.json');

function AuthorTable() {
  const [highAuthors, setHighAuthors] = useState([]);
  const [bestAuthors, setBestAuthors] = useState([]);
  const [valueAuthors, setValueAuthors] = useState([]);

  const [genreAuthors, setGenreAuthors] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');

  const [bookAuthors, setBookAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/author`)
      .then(response => response.json())
      .then(data => {
        setHighAuthors(data.highAuthors);
        setBestAuthors(data.bestAuthors);
        setValueAuthors(data.valueAuthors);
    })
      .catch(error => console.error('Error:', error));
  }, []);

  const highAuthorsColumns = [
    {
      field: 'author',
      headerName: 'Author',
    },
    {
      field: 'num_titles',
      headerName: 'Number of Titles'
    }
  ]

  const bestAuthorsColumns = [
    {
      field: 'author',
      headerName: 'Author',
    },
    {
      field: 'average_score',
      headerName: 'Average Rating'
    }
  ]

  const valueAuthorsColumns = [
    {
      field: 'author',
      headerName: 'Author',
    },
    {
      field: 'price_per_score',
      headerName: 'Cost per Star'
    }
  ]

  const genreAuthorsColumns = [
    {
      field: 'author',
      headerName: 'Author',
    },
    {
      field: 'num_books',
      headerName: 'Number of Books'
    },
    {
      field: 'num_ratings',
      headerName: 'Number of Ratings',
    },
    {
      field: 'average_score',
      headerName: 'Average Rating',
    }
  ]

  const bookAuthorsColumns = [
    {
      field: 'title',
      headerName: 'Book Title',
    },
    {
      field: 'average_rating',
      headerName: 'Average Rating',
    }
  ]

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
  };

  const handleAuthorChange = () => {
    fetchAuthorData(selectedAuthor)
  };

  const fetchGenreData = async (genre) => {
    try {
      const response = await fetch(`http://${config.server_host}:${config.server_port}/author/genre/${genre}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setGenreAuthors(data); 
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const fetchAuthorData = async (author) => {
    console.log('Searching for author:', author);
    try {
      const response = await fetch(`http://${config.server_host}:${config.server_port}/author/name/${author}`);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Data received for author:', data);
  
      setBookAuthors(data); 
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };
  
  useEffect(() => {
    if (selectedGenre) {
      fetchGenreData(selectedGenre);
    }
  }, [selectedGenre]);

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
};

  return (
    <div style = {{display: 'grid', marginLeft: '40px', marginRight: '40px', gridRowGap: '20px'}}>
  
      <div style={{ display: 'grid', flexDirection: 'column', gridTemplateColumns: '1fr 1fr 1fr', gridColumnGap: '20px'}}>
        <div> 
          <div class="header-container" style={headerStyle}>      
            <h2>Most Prolific Authors</h2> 
            <Tooltip title="Authors with the most number of books">
              <IconButton aria-label="Info">
                  <InfoIcon />
              </IconButton> 
            </Tooltip>       
          </div>
          <StaticTable data={highAuthors} columns={highAuthorsColumns} /> 
        </div>
        <div> 
          <div class="header-container" style={headerStyle}> 
            <h2>Highly Rated Authors</h2> 
            <Tooltip title="Highest rated authors with at least 500 ratings">
              <IconButton aria-label="Info">
                  <InfoIcon />
              </IconButton> 
            </Tooltip> 
          </div>
          <StaticTable data={bestAuthors} columns={bestAuthorsColumns} /> </div>
        <div> 
          <div class="header-container" style={headerStyle}> 
            <h2>Highest Value Authors</h2> 
            <Tooltip title="Authors with the 'best value' (based on average book price / average star rating)">
              <IconButton aria-label="Info">
                  <InfoIcon />
              </IconButton> 
            </Tooltip> 
          </div>
          <StaticTable data={valueAuthors} columns={valueAuthorsColumns} /> 
        </div>
      </div>

      <div style={{ display: 'grid', flexDirection: 'column', gridTemplateColumns: '1fr 1fr', gridColumnGap: '20px'}}>
        <div> 
            <h2>Top Authors by Genre</h2>     
            <FormControl fullWidth style = {{marginBottom: '15px'}}>
            <InputLabel id="demo-simple-select-label">Genre</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Genre"
              value={selectedGenre}
              onChange={handleGenreChange}>
                      <MenuItem value={'Fiction'}>Fiction</MenuItem>
                      <MenuItem value={'History'}>History</MenuItem>
                      <MenuItem value={'Religion'}>Religion</MenuItem>
                      <MenuItem value={'Biography & Autobiography'}>Biography & Autobiography</MenuItem>
                      <MenuItem value={'Business & Economics'}>Business & Economics</MenuItem>
                      <MenuItem value={'Computers'}>Computers</MenuItem>
            </Select>
            </FormControl>
            <StaticTable data={genreAuthors} columns={genreAuthorsColumns}/> 
        </div>

        <div> 
            <h2>Top Books by Author</h2> 
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TextField
                label="Search"
                variant="outlined"
                value={selectedAuthor}
                onChange={(event) => setSelectedAuthor(event.target.value)}
                style={{ marginBottom: '15px', width: '70%' }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAuthorChange}
                style={{ height: '38px', marginBottom: '18px'}}>
                Search
              </Button>
            </div>
            <StaticTable data={bookAuthors} columns={bookAuthorsColumns}/> 
        </div>

        
      </div>

    </div>
  )
}
export default AuthorTable;
  


