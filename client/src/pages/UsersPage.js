import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// import SongCard from '../components/SongCard';
// import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function UsersPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  // const [selectedUserId, setSelectedUserId] = useState(null);

  const [username, setUsername] = useState('');
  const [reviews, setReviews] = useState([0, 300]);
  const [helpfulness, setHelpfulness] = useState([0, 1]);
  const [order_by, setOrderBy] = useState('');
  // const [energy, setEnergy] = useState([0, 1]);
  // const [valence, setValence] = useState([0, 1]);
  // const [explicit, setExplicit] = useState(false);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/users`)
      .then(res => res.json())
      .then(resJson => {
        const usersWithId = resJson.map((user) => ({ id: user.userId, ...user }));
        setData(usersWithId);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/users?username=${username}` +
      `&reviews_low=${reviews[0]}&reviews_high=${reviews[1]}` +
      `&helpfulness_low=${helpfulness[0]}&helpfulness_high=${helpfulness[1]}` +
      `&orderBy=${order_by}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const usersWithId = resJson.map((user) => ({ id: user.userId, ...user }));
        setData(usersWithId);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'profileName', headerName: 'Username', flex: 1.5//, renderCell: (params) => (
        //<Link onClick={() => setSelectedSongId(params.row.song_id)}>{params.value}</Link>
    //)
    },
    { field: 'helpfulness', headerName: 'Average Helpfulness', flex: 1},
    { field: 'num_reviews', headerName: 'Number of Reviews', flex: 1}
    // { field: 'danceability', headerName: 'Danceability' },
    // { field: 'energy', headerName: 'Energy' },
    // { field: 'valence', headerName: 'Valence' },
    // { field: 'tempo', headerName: 'Tempo' },
    // { field: 'key_mode', headerName: 'Key' },
    // { field: 'explicit', headerName: 'Explicit' },
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      <h2>Search Users</h2>
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <TextField label='Username' value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel
            label='Sort by Reviews'
            control={<Checkbox checked={order_by} onChange={(e) => setOrderBy('num_reviews')} />}
          />
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel
            label='Sort by Helpfulness'
            control={<Checkbox checked={order_by} onChange={(e) => setOrderBy('helpfulness')} />}
          />
        </Grid>
        <Grid item xs={6}>
          <p>Average Helpfulness</p>
          <Slider
            value={helpfulness}
            min={0}
            max={1}
            step={0.01}
            onChange={(e, newValue) => setHelpfulness(newValue)}
            valueLabelDisplay='auto'
            //valueLabelFormat={value => <div>{formatDuration(value)}</div>}
          />
        </Grid>
        <Grid item xs={6}>
          <p>Number of Reviews</p>
          <Slider
            value={reviews}
            min={0}
            max={300}
            step={1}
            onChange={(e, newValue) => setReviews(newValue)}
            valueLabelDisplay='auto'
            //valueLabelFormat={value => <div>{value / 1000000}</div>}
          />
        </Grid>

      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container>
  );
}
