import { useEffect, useState } from 'react';
import { InputLabel, MenuItem, FormControl, Select, TextField, Button} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import StaticTable from '../components/StaticTable';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
const config = require('../config.json');

function PublisherTable() {
    
    const [highPublishers, setHighPublishers] = useState([]);
    const [bestPublishers, setBestPublishers] = useState([]);
    const [valuePublishers, setValuePublishers] = useState([]);
  
    const [genrePublishers, setGenrePublishers] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
  
    const [authorPublishers, setAuthorPublishers] = useState([]);
    const [selectedPublisher, setSelectedPublisher] = useState('');
   
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/publisher`)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            setHighPublishers(data.highPublishers);
            setBestPublishers(data.topPublishers);
            setValuePublishers(data.valuePublishers);
        })
          .catch(error => console.error('Error:', error));
      }, []);
    
      const highPublishersColumns = [
        {
          field: 'publisher',
          headerName: 'Publisher',
        },
        {
          field: 'num_books',
          headerName: 'Number of Titles'
        }
      ]
    
      const bestPublishersColumns = [
        {
          field: 'publisher',
          headerName: 'Publisher',
        },
        {
          field: 'avg_rating',
          headerName: 'Average Rating'
        }
      ]
    
      const valuePublishersColumns = [
        {
          field: 'publisher',
          headerName: 'Publisher',
        },
        {
          field: 'price_per_score',
          headerName: 'Cost per Star'
        }
      ]
    
      const genrePublishersColumns = [
        {
          field: 'publisher',
          headerName: 'Publisher',
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
    
      const authorPublishersColumns = [
        {
          field: 'author',
          headerName: 'Author',
        },
        {
          field: 'cnt',
          headerName: 'Number of Books',
        }
      ]
    
      const handleGenreChange = (event) => {
        setSelectedGenre(event.target.value);
      };
    
      const handlePublisherChange = () => {
        fetchPublisherData(selectedPublisher)
      };
    
      const fetchGenreData = async (genre) => {
        try {
          const response = await fetch(`http://${config.server_host}:${config.server_port}/publisher/genre/${genre}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setGenrePublishers(data);
        } catch (error) {
          console.error('Fetch error:', error);
        }
      };
    
      const fetchPublisherData = async (publisher) => {
        try {
          const response = await fetch(`http://${config.server_host}:${config.server_port}/publisher/name/${publisher}`);
          if (!response.ok) {
            throw new Error(`Network response was not ok. Status: ${response.status}`);
          }

          const data = await response.json();
    
          setAuthorPublishers(data);
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
                <h2>Top Publishers by Volume</h2> 
                <Tooltip title="Publishers with the most number of books">
                <IconButton aria-label="Info">
                    <InfoIcon />
                </IconButton> 
                </Tooltip>       
            </div>
            <StaticTable data={highPublishers} columns={highPublishersColumns} /> 
            </div>
            <div> 
            <div class="header-container" style={headerStyle}> 
                <h2>Top Publishers by Rating</h2> 
                <Tooltip title="Highest rated publishers with at least 1000 ratings">
                <IconButton aria-label="Info">
                    <InfoIcon />
                </IconButton> 
                </Tooltip> 
            </div>
            <StaticTable data={bestPublishers} columns={bestPublishersColumns} /> </div>
            <div> 
            <div class="header-container" style={headerStyle}> 
                <h2>Highest Value Publishers</h2> 
                <Tooltip title="Publishers with the 'best value' (based on average book price / average star rating)">
                <IconButton aria-label="Info">
                    <InfoIcon />
                </IconButton> 
                </Tooltip> 
            </div>
            <StaticTable data={valuePublishers} columns={valuePublishersColumns} /> 
            </div>
        </div>

        <div style={{ display: 'grid', flexDirection: 'column', gridTemplateColumns: '1fr 1fr', gridColumnGap: '20px'}}>
            <div>
                <h2>Top Publishers by Genre</h2>
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
                <StaticTable data={genrePublishers} columns={genrePublishersColumns}/>
            </div>

            <div>
            <h2>Top Authors by Publisher</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TextField
                label="Search"
                variant="outlined"
                value={selectedPublisher}
                onChange={(event) => setSelectedPublisher(event.target.value)}
                style={{ marginBottom: '15px', width: '70%' }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handlePublisherChange}
                style={{ height: '38px', marginBottom: '18px'}}>
                Search
              </Button>
            </div>
            <StaticTable data={authorPublishers} columns={authorPublishersColumns}/>
        </div>


        </div>
  </div>
)

}
export default PublisherTable;