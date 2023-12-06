import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { formatDuration, formatReleaseDate } from '../helpers/formatter';
import {useTheme} from '@mui/system';
const config = require('../config.json');


export default function BookInfoPage() {
  const { title } = useParams();
  const theme = useTheme();
 const [bookData1, setBookData] = useState({bookDetails: [], ratings: []}); // default should actually just be [], but empty object element added to avoid error in template code
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState(null);


  useEffect(() => {
setIsLoading(true);
    fetch(`http://${config.server_host}:${config.server_port}/bookpopup/${title}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      }
      )
      .then(resJson => {
        setBookData(resJson);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Eror fetching data', error);
        setError(error);
        setIsLoading(false);
      });
     //console.log(resJson);
  }, [title]);

  if (isLoading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const firstBookDetails = bookData1.bookDetails.length > 0 ? bookData1.bookDetails[0] :null ;
  const firstBookRatings = bookData1.ratings

  return (
    <div>
    {firstBookDetails && (
    <Container>
        <div>
        <Stack direction='row' justify='center'>
        <img
          key={firstBookDetails.title}
          src={firstBookDetails.image}
          alt={`${firstBookDetails.title} album art`}
          style={{
            marginTop: '40px',
            marginRight: '40px',
            marginBottom: '40px'
          }}
        />
        <Stack>
          <h1 style={{ fontSize: 44 }}>{firstBookDetails.title}</h1>
          <p>Authors: {firstBookDetails.author}</p>
          <p>Published By: {firstBookDetails.publisher}</p>
        </Stack>
      </Stack>
        </div>
        <div>
            <p>Description: {firstBookDetails.description}</p>
        </div>
        <h2>User Ratings Table</h2>
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow style={{backgroundColor: theme.palette.primary.main }}>
              <TableCell key='user id' style={{ color: 'white', textAlign: 'center' }}>Profile Name</TableCell>
              <TableCell key='Score' style={{ color: 'white', textAlign: 'center' }}>Score</TableCell>
              <TableCell key='Summary' style={{ color: 'white', textAlign: 'center' }}>Summary</TableCell>
              <TableCell key='Review' style={{ color: 'white', textAlign: 'center' }}>Review</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {firstBookRatings.map(bd => (
              <TableRow key={bd.userId}>
                <TableCell key='user id'>{bd.profileName}</TableCell>
                <TableCell key='Score'>{bd.score}</TableCell>
                <TableCell key='Summary'>{bd.summary}</TableCell>
                <TableCell key='Review'>{bd.ratingText}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <p>Find out more about "{firstBookDetails.title}" <a href = {firstBookDetails.infoLink}>Here!</a></p>
    </Container>
      )}
  </div>
  );
}

//{firstBookDetails && (
//  <div>
//    <p>Title: {firstBookDetails.title}</p>
//  </div>
//)}