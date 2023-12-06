const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

app.get('/users', routes.users);
app.get('/search_bar', routes.search_bar);
app.get('/random_book', routes.random_book);
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
