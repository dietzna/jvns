const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

function queryDatabase(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/******************
 * WARM UP ROUTES *
 ******************/
// Route for users
const users = async function(req, res) {
  const username = req.query.username ?? "";
	const reviewsLow = req.query.reviews_low ?? 0;
	const reviewsHigh = req.query.reviews_high ?? 150;
	const helpfulnessLow = req.query.helpfulness_low ?? 0;
	const helpfulnessHigh = req.query.helpfulness_high ?? 1;
  const orderBy = req.query.order_by ?? "num_reviews";

	connection.query(
		`WITH avg_ratings AS (
      SELECT userId, AVG(helpfulness) AS helpfulness, COUNT(*) AS num_reviews
      FROM Ratings
      GROUP BY userId
    )
    SELECT profileName, helpfulness, num_reviews
    FROM User u JOIN avg_ratings r ON u.userId = r.userId
    WHERE profileName LIKE '%${username}%'
    AND (helpfulness  BETWEEN ${helpfulnessLow} AND ${helpfulnessHigh})
    AND (num_reviews BETWEEN ${reviewsLow} AND ${reviewsHigh})
    ORDER BY ${orderBy} DESC
    LIMIT 10;
    `,
		(err, data) => {
			if (err || data.length === 0) {
				console.log(err);
				res.json([]);
			} else {
				res.json(data);
			}
		}
	);
}

// Route for books search bar
const search_bar = async function(req, res) {
  if (req.query.type === 'title') {
    var book_title = req.query.keyword;
    connection.query(`
    SELECT b.title, publisher, publishedDate, author, categories
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE b.title LIKE '%${book_title}%'
    LIMIT 100
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data)
    }
  });
  } else if (req.query.type === 'author') {
    var author = req.query.keyword;
    connection.query(`
    SELECT b.title, publisher, publishedDate, author, categories
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE a.author LIKE '%${author}%'
    LIMIT 10
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data)
    }
  });
  } else if (req.query.type === 'genre') {
    var genre = req.query.keyword;
    connection.query(`
    SELECT b.title, publisher, publishedDate, author, categories
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE b.categories LIKE '%${genre}%'
    LIMIT 10
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data)
    }
  });
  } else if (req.query.type === 'publisher') {
    var publisher = req.query.keyword;
    connection.query(`
    SELECT b.title, publisher, publishedDate, author, categories
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE b.publisher LIKE '%${publisher}%'
    LIMIT 10
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data)
    }
  });
  } else {
    // we can also send back an HTTP status code to indicate an improper request
    res.status(400).send(`'${req.query.type}' or '${req.query.keyword} is not a valid input. Must be title, author, genre, or publisher'.`);
  }
}

// Route for getting book of the day
const random_book = async function(req, res) {
  connection.query(`
    SELECT b.title, publisher, publishedDate, author, categories, image
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE b.title IS NOT NULL AND author IS NOT NULL and image IS NOT NULL
    ORDER BY RAND()
    LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
        res.json(data[0])
    }
  });
}

// Route 2: GET /random
const random = async function(req, res) {
  const explicit = req.query.explicit === 'true' ? 1 : 0;
  connection.query(`
    SELECT *
    FROM Songs
    WHERE explicit <= ${explicit}
    ORDER BY RAND()
    LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json({
        song_id: data[0].song_id,
        title: data[0].title
      });
    }
  });
}

/********************************
 * BASIC SONG/ALBUM INFO ROUTES *
 ********************************/

// Route 3: GET /song/:song_id
const song = async function(req, res) {
  // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
  // Hint: unlike route 2, you can directly SELECT * and just return data[0]
  // Most of the code is already written for you, you just need to fill in the query
  var specified_song = req.params.song_id;
  connection.query(`
  SELECT *
  FROM Songs
  WHERE song_id LIKE '${specified_song}'`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data[0]);
    }
  });
}

// Route 4: GET /album/:album_id
const album = async function(req, res) {
  // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
  var specified_album = req.params.album_id
  connection.query(`
  SELECT *
  FROM Albums
  WHERE album_id LIKE '${specified_album}'`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data[0]);
    }
  });
}

// Route 5: GET /albums
const albums = async function(req, res) {
  // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
  // Note that in this case you will need to return multiple albums, so you will need to return an array of objects
  let album_arr = []
  connection.query(`
  SELECT *
  FROM Albums
  ORDER BY release_date DESC`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
        res.json(data);
    }
  });
  };


// Route 6: GET /album_songs/:album_id
const album_songs = async function(req, res) {
  specified_album_song = req.params.album_id
  // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
  let album_arr_songs = []
  connection.query(`
  SELECT S.song_id, S.title, S.number, S.duration, S.plays
  FROM Albums A JOIN Songs S ON A.album_id=S.album_id
  WHERE A.album_id LIKE '${specified_album_song}'
  ORDER BY S.number
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

/************************
 * ADVANCED INFO ROUTES *
 ************************/

// Route 7: GET /top_songs
const top_songs = async function(req, res) {
  const page = req.query.page;
  const pageSizeOriginal = req.query.page_size
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  // only set pageSize to 10 if page is non-null
  const pageSizeFinal = pageSizeOriginal ?? 10

  if (!page) {
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
    let top_songs_list = []
    connection.query(`
    SELECT S.song_id, S.title AS title, A.album_id, A.title AS album, S.plays
    FROM Albums A JOIN Songs S ON A.album_id = S.album_id
    ORDER BY plays DESC
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
      res.json([]);
    } else {
        res.json(data);
    }
  });
  } else {
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
    let top_songs_list = []
    offset = (page*pageSizeFinal)-pageSizeFinal
    connection.query(`
    SELECT S.song_id, S.title AS title, A.album_id, A.title AS album, S.plays
    FROM Albums A JOIN Songs S ON A.album_id = S.album_id
    ORDER BY plays DESC
    LIMIT ${pageSizeFinal} OFFSET ${offset}`, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
      res.json([]);
    } else {
        res.json(data);
    }
  });
}
}

// Route 8: GET /top_albums
const top_albums = async function(req, res) {
  // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
  // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
   const page = req.query.page;
  const pageSizeOriginal = req.query.page_size
  const pageSizeFinal = pageSizeOriginal ?? 10

  if (!page) {
    connection.query(`
    SELECT A.album_id AS album_id, A.title AS title, SUM(S.plays) AS plays
    FROM Albums A JOIN Songs S ON A.album_id = S.album_id
    GROUP BY album_id
    ORDER BY plays DESC
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
      res.json([]);
    } else {
        res.json(data);
    }
  });
  } else {
    offset = (page*pageSizeFinal)-pageSizeFinal
    connection.query(`
    SELECT A.album_id AS album_id, A.title AS title, SUM(S.plays) AS plays
    FROM Albums A JOIN Songs S ON A.album_id = S.album_id
    GROUP BY album_id
    ORDER BY plays DESC
    LIMIT ${pageSizeFinal} OFFSET ${offset}`, (err, data) => {
      if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}
}
// Route 9: GET /search_albums
const search_songs = async function(req, res) {
  // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
  // Some default parameters have been provided for you, but you will need to fill in the rest
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;
  const playsLow = req.query.plays_low ?? 0;
  const playsHigh = req.query.plays_high ?? 1100000000;
  const danceabilityLow = req.query.danceability_low ?? 0;
  const danceabilityHigh = req.query.danceability_high ?? 1;
  const energyLow = req.query.energy_low ?? 0;
  const energyHigh = req.query.energy_high ?? 1;
  const valenceLow = req.query.valence_low ?? 0;
  const valenceHigh = req.query.valence_high ?? 1;
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  connection.query(`
  SELECT *
  FROM Songs
  WHERE title LIKE '%${title}%' AND explicit <= ${explicit} AND
      duration BETWEEN ${durationLow} AND ${durationHigh}
      AND ${playsLow} <= plays AND plays<= ${playsHigh}
      AND ${danceabilityLow} <= danceability AND danceability <= ${danceabilityHigh}
      AND ${energyLow} <= energy AND energy <= ${energyHigh}
      AND ${valenceLow} <= valence AND valence <= ${valenceHigh}
  ORDER BY title
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
        res.json(data);
    }
  });
}

const author = async function(req, res) {
  try {
    const highAuthorsData = await queryDatabase(`
      SELECT
        a.author,
        COUNT(*) AS num_titles
      FROM books_db.Authors a
      GROUP BY a.author
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `);

    const bestAuthorsData = await queryDatabase(`
      SELECT
        a.author,
        count(DISTINCT a.title) as num_books,
        COUNT(DISTINCT r.id, r.userId) as num_ratings,
        avg(r.score) as average_score
      FROM books_db.Authors a
      left join books_db.Books b on a.title = b.title
      left join books_db.Ratings r on b.id = r.id
      GROUP BY a.author
      having COUNT(DISTINCT r.id, r.userId) > 500 and num_books > 5
      ORDER BY avg(r.score) DESC
      limit 10
    `);

    // const valueAuthorsData = await queryDatabase(`
    //   SELECT
    //     a.author,
    //     count(DISTINCT a.title) as num_books,
    //     COUNT(DISTINCT r.id, r.userId) as num_ratings,
    //     avg(r.score) as average_score,
    //     avg(b.price) as average_price,
    //     avg(b.price)/avg(r.score) as price_per_score
    //   FROM books_db.Authors a
    //   left join books_db.Books b on a.title = b.title
    //   left join books_db.Ratings r on b.id = r.id
    //   GROUP BY a.author
    //   having COUNT(DISTINCT r.id, r.userId) > 100 and avg(r.score) > 0
    //   ORDER BY price_per_score
    //   limit 10
    // `);

    if (highAuthorsData.length === 0 && bestAuthorsData.length === 0) {
      return res.json({});
    }
    const result = {
      highAuthors: highAuthorsData,
      bestAuthors: bestAuthorsData,
    };

    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({});
  }
};

const genre_authors = async function(req, res) {
  connection.query(`
  SELECT
    a.author,
    count(DISTINCT a.title) as num_books,
    COUNT(DISTINCT r.id, r.userId) as num_ratings,
    avg(r.score) as average_score
  FROM books_db.Authors a
  left join books_db.Books b on a.title = b.title
  left join books_db.Ratings r on b.id = r.id
  WHERE b.categories = '${req.params.genre}'
  GROUP BY a.author
  having COUNT(DISTINCT r.id, r.userId) > 100 and count(DISTINCT a.title) > 5
  ORDER BY avg(r.score) DESC
  limit 10
  `, (err, data) => {
    if (err || data.length === 0){
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  })
}

const author_top = async function(req, res) {
  connection.query(`
    SELECT
      a.author,
      a.title,
      avg(r.score) as average_Rating
    FROM books_db.Authors a
    left join books_db.Books b on a.title = b.title
    left join books_db.Ratings r on b.id = r.id
    WHERE a.author = '${req.params.author}'
    group by a.author, a.title
    ORDER BY avg(r.score) DESC
    limit 5
  `, (err, data) => {
    if (err || data.length === 0){
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  })
}

// Route 1: GET /bookpopup
const bookpopup = async function(req, res) {
    var book_title = req.params.title;
    connection.query(`
    SELECT b.title, group_concat(a.author), b.publisher, b.categories, b.description, b.image, b.infoLink
    FROM Books b, Authors a
    WHERE b.title = a.title and b.title LIKE '${book_title}'
    GROUP BY b.title, b.publisher, b.categories, b.description, b.image, b.infoLink
    ORDER BY b.publisher, b.title, a.author`, (err, bookData) => {
      if (err || bookData.length === 0) {
        console.log(err);
        res.json([]);
        //return
      } else {
      connection.query(`
        With inventory as(
          SELECT b.title, c.author, b.infoLink, r.userId, r.score, r.summary, r.ratingText,
          ROW_NUMBER() OVER (
                    PARTITION BY b.title
                    ORDER BY r.helpfulness DESC) row_num
          FROM Books b, Ratings r, (SELECT a.id as id, group_concat(b.author) as author
                                    FROM  Books a, Authors b
                                    WHERE a.title = b. title group by a.id) c
          WHERE b.id = r.id and b.id = c.id and b.title LIKE '${book_title}'
          )
          SELECT *
          FROM
            inventory
          WHERE
            row_num < 4`, (err, ratingData) => {
      if (err || ratingData.length === 0) {
        console.log(err);
        res.json({ bookDetails: bookData, ratings: [] });
      } else {
        res.json({ bookDetails: bookData, ratings: ratingData });
      }
    });
      }
    });
  }
//route 2 get /publisher
const publisher = async function(req, res) {
  try {
      const pubtopauthdata = await queryDatabase(`
      WITH inventory
      AS (SELECT
             b.publisher,
             a.author,
             Count(*) cnt,
             ROW_NUMBER() OVER (
                PARTITION BY b.publisher
                ORDER BY Count(*) DESC) row_num
          FROM
             Books b, Authors a
          WHERE
             b.title = a.title
          GROUP BY
              b.publisher, a.author
         )
      SELECT
         publisher,
         author
      FROM
         inventory
      WHERE
         row_num < 4
      `);
      const pubavgpricedata = await queryDatabase(`
      SELECT publisher, Avg(Price)
      FROM Books
      GROUP BY publisher
      `);
      const pubtopcatdata = await queryDatabase(`
      WITH inventory
      AS (SELECT
            publisher,
            categories,
            Count(*) cnt,
            ROW_NUMBER() OVER (
                PARTITION BY publisher
                ORDER BY Count(*) DESC) row_num
        FROM
          Books
        Where categories is not null
          group by publisher,
        categories
        )
      SELECT
        publisher,
        categories
      FROM
        inventory
      WHERE
        row_num < 4`);
      if (pubtopcatdata.length === 0 && pubavgpricedata.length === 0 && pubtopauthdata.length === 0) {
        return res.json({});
      }
      const result = {
        pubTopAuthor: pubtopauthdata,
        pubAvgPrice: pubavgpricedata,
        pubTopCat: pubtopcatdata,
      };
      res.json(result);
    } catch (err) {
      console.log(err);
      res.json({});
    }
  };

module.exports = {
  users,
  search_bar,
  random_book,
  author,
  random,
  song,
  album,
  albums,
  album_songs,
  top_songs,
  top_albums,
  search_songs,
	author,
  genre_authors,
  author_top,
    publisher,
    bookpopup
}
