const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
//
// ex: use a GET http request method when a /author/:type
// endpoint is specified to execute routes.author handler
app.get('/users', routes.users);
app.get('/search_bar', routes.search_bar);
app.get('/random_book', routes.random_book);
app.get('/author/:type', routes.author);
app.get('/random', routes.random);
app.get('/song/:song_id', routes.song);
app.get('/album/:album_id', routes.album);
app.get('/albums', routes.albums);
app.get('/album_songs/:album_id', routes.album_songs);
app.get('/top_songs', routes.top_songs);
app.get('/top_albums', routes.top_albums);
app.get('/search_songs', routes.search_songs);
app.get('/author', routes.author);
app.get('/author/genre/:genre', routes.genre_authors);
app.get('/author/name/:author', routes.author_top);
app.get('/publisher', routes.publisher);
app.get('/publisher/genre/:genre', routes.genre_publishers);
app.get('/publisher/name/:publisher', routes.publisher_top);
app.get('/bookpopup/:title', routes.bookpopup);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
