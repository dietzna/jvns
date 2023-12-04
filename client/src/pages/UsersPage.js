import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import CustomTable from '../components/CustomTable';

const config = require('../config.json');

export default function UsersPage() {
  const [data, setData] = useState([]);
  // const [selectedUserId, setSelectedUserId] = useState(null);

  const [username, setUsername] = useState('');
  const [reviews, setReviews] = useState([0, 1400]);
  const [helpfulness, setHelpfulness] = useState([0, 1]);
  const [order_by, setOrderBy] = useState('numReviews');
  const [isReviewsChecked, setIsReviewsChecked] = useState(false);
  const [isHelpChecked, setIsHelpChecked] = useState(false);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/users`)
      .then(res => res.json())
      .then(resJson => {
        //const usersWithId = resJson.map((user) => ({ id: user.userId, ...user }));
        const usersWithId = resJson.map((user) =>
        ({ id: user.userId,
          profileName: user.profileName,
          avgHelpfulness: Math.round(user.avgHelpfulness * 100) + '%',
          numReviews: user.numReviews}));
        setData(usersWithId);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/users?username=${username}` +
      `&reviews_low=${reviews[0]}&reviews_high=${reviews[1]}` +
      `&helpfulness_low=${helpfulness[0]}&helpfulness_high=${helpfulness[1]}` +
      `&order_by=${order_by}`
    )
      .then(res => res.json())
      .then(resJson => {
        //const usersWithId = resJson.map((user) => ({ id: user.userId, ...user }));
        const usersWithId = resJson.map((user) =>
        ({ id: user.userId,
          profileName: user.profileName,
          avgHelpfulness: Math.round(user.avgHelpfulness * 100) + '%',
          numReviews: user.numReviews}));
        setData(usersWithId);
      });
  }

  const columns = [
    { field: 'profileName', headerName: 'Username', flex: 1.5//, renderCell: (params) => (
        //<Link onClick={() => setSelectedSongId(params.row.song_id)}>{params.value}</Link>
    //)
    },
    { field: 'avgHelpfulness', headerName: 'Average Helpfulness', flex: 1},
    { field: 'numReviews', headerName: 'Number of Reviews', flex: 1}
  ]

  const handleChangeOrderByReviews = () => {
    setIsReviewsChecked(!isReviewsChecked);
    setOrderBy('numReviews');
    if (isHelpChecked) {
      setIsHelpChecked(!isHelpChecked);
    }
  }

  const handleChangeOrderByHelp = () => {
    setIsHelpChecked(!isHelpChecked);
    setOrderBy('avgHelpfulness');
    if (isReviewsChecked) {
      setIsReviewsChecked(!isReviewsChecked);
    }
  }

  return (
    <Container>
      <h2>Search Users</h2>
      <Grid container spacing={4}>
      <Grid item xs={6}>
          <TextField label='Username' value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%" }}/>
        </Grid>

        <Grid item xs={3}>
          <FormControlLabel
            label='Sort by Reviews'
            control={<Checkbox
              checked={isReviewsChecked}
              onChange={handleChangeOrderByReviews} />}
          />
        </Grid>

        <Grid item xs={3}>
          <FormControlLabel
            label='Sort by Helpfulness'
            control={<Checkbox
              checked={isHelpChecked}
              onChange={handleChangeOrderByHelp} />}
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
          />
        </Grid>

        <Grid item xs={6}>
          <p>Number of Reviews</p>
          <Slider
            value={reviews}
            min={0}
            max={1400}
            step={1}
            onChange={(e, newValue) => setReviews(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>

      <Grid item xs={12}>
        <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      </Grid>

      </Grid>

      <h2>Results</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(data.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <CustomTable data={data} keyColumns={columns} />
        )
        )}
      </div>
    </Container>
  );
}
