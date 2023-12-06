const mysql = require('mysql')
const config = require('./config.json')

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

// Route for users
const users = async function(req, res) {
  const username = req.query.username ?? "";
	const reviewsLow = req.query.reviews_low ?? 0;
	const reviewsHigh = req.query.reviews_high ?? 2500;
	const helpfulnessLow = req.query.helpfulness_low ?? 0;
	const helpfulnessHigh = req.query.helpfulness_high ?? 1;
  const orderBy = req.query.order_by ?? "numReviews";

  connection.query(
    `WITH avg_ratings AS (
      SELECT userId, AVG(helpfulness) AS avgHelpfulness, COUNT(score) AS numReviews
      FROM Ratings
      GROUP BY userId
    )
    SELECT profileName, avgHelpfulness, r.numReviews
    FROM User u JOIN avg_ratings r ON u.userId = r.userId
    WHERE profileName LIKE '%${username}%'
    AND (avgHelpfulness  BETWEEN ${helpfulnessLow} AND ${helpfulnessHigh})
    AND (numReviews BETWEEN ${reviewsLow} AND ${reviewsHigh})
    ORDER BY ${orderBy} DESC
    LIMIT 500;`,
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
    SELECT b.title, b.publisher, GROUP_CONCAT(a.author) as authors, b.categories
      FROM Books b JOIN Authors a ON b.title = a.title
      WHERE b.title LIKE '%${book_title}%'
      GROUP BY b.title, b.publisher, b.categories
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
    SELECT b.title, b.publisher, GROUP_CONCAT(a.author) as authors, b.categories
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE a.author LIKE '%${author}%'
    GROUP BY b.title, b.publisher, b.categories
    LIMIT 100
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
    SELECT b.title, b.publisher, GROUP_CONCAT(a.author) as authors, b.categories
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE b.categories LIKE '%${genre}%'
    GROUP BY b.title, b.publisher, b.categories
    LIMIT 100
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
    SELECT b.title, b.publisher, GROUP_CONCAT(a.author) as authors, b.categories
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE b.publisher LIKE '%${publisher}%'
    GROUP BY b.title, b.publisher, b.categories
    LIMIT 100
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
    SELECT b.title, GROUP_CONCAT(a.author) as author, image
    FROM Books b JOIN Authors a ON b.title = a.title
    WHERE b.title IS NOT NULL AND author IS NOT NULL and image IS NOT NULL
    GROUP BY b.title, b.publisher, b.categories
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

// Route for getting author
const author = async function(req, res) {
  try {
    const highAuthorsData = await queryDatabase(`
    SELECT *
    FROM authors_high_materialized
    `);

    const bestAuthorsData = await queryDatabase(`
    SELECT *
    FROM authors_best_materialized
    `);

    const valueAuthorsData = await queryDatabase(`
    SELECT author, num_books, num_ratings, average_score, average_price, CONCAT('$', FORMAT(price_per_score, 2)) as price_per_score
    FROM authors_value_materialized
    `);

    if (highAuthorsData.length === 0 && bestAuthorsData.length === 0) {
      return res.json({});
    }
    const result = {
      highAuthors: highAuthorsData,
      bestAuthors: bestAuthorsData,
      valueAuthors: valueAuthorsData
    };

    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({});
  }
};

// Route for getting genre, authors, etc.
const genre_authors = async function(req, res) {
  connection.query(`
  SELECT
    a.author,
    count(DISTINCT a.title) as num_books,
    COUNT(DISTINCT r.id, r.userId) as num_ratings,
    round(avg(r.score),2) as average_score
  FROM books_db.Authors a
  join books_db.Books b on a.title = b.title
  join books_db.Ratings r on b.id = r.id
  where categories = '${req.params.genre}'
  GROUP BY a.author
  having COUNT(DISTINCT r.id, r.userId) > 50
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

// Route for getting top authors
const author_top = async function(req, res) {
  connection.query(`
    SELECT
      a.author,
      a.title as title,
      round(avg(r.score), 2) as average_rating
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

// Route for bookpopup
const bookpopup = async function(req, res) {
    var book_title = req.params.title;
    connection.query(`
    SELECT b.title, group_concat(a.author) as author, b.publisher, b.categories, b.description, b.image, b.infoLink
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
        SELECT a.title, a.author, a.infoLink, u.profileName, a.score, a.summary, a.ratingText, a.row_num
        FROM
          inventory a, User u
        WHERE
          row_num < 6 and a.userId = u.UserId`, (err, ratingData) => {
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

// Route for publisher
const publisher = async function(req, res) {
  try {
      const highPublishersData = await queryDatabase(`
      SELECT *
      FROM publishers_high_materialized
      `);
      const topPublishersData = await queryDatabase(`
      SELECT *
      FROM publishers_best_materialized
      `);
      const valuePublishersData = await queryDatabase(`
      SELECT publisher, num_books, num_ratings, average_score, average_price, CONCAT('$', FORMAT(price_per_score, 2)) as price_per_score
    FROM publishers_value_materialized`);
      if (highPublishersData.length === 0 && topPublishersData.length === 0 && valuePublishersData.length === 0) {
        return res.json({});
      }
      const result = {
        highPublishers: highPublishersData,
        topPublishers: topPublishersData,
        valuePublishers: valuePublishersData,
      };
      res.json(result);
    } catch (err) {
      console.log(err);
      res.json({});
    }
  };

// Route for getting genre, publishers, etc.
const genre_publishers = async function(req, res) {
    connection.query(`
    SELECT
      b.publisher,
      count(DISTINCT b.id) as num_books,
      COUNT(DISTINCT r.id, r.userId) as num_ratings,
      round(avg(r.score),2) as average_score
    FROM books_db.Books b
    join books_db.Ratings r on b.id = r.id
    where categories = '${req.params.genre}'
    GROUP BY b.publisher
    having COUNT(DISTINCT r.id, r.userId) > 500
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

// Route for getting top publishers
const publisher_top = async function(req, res) {
    connection.query(`
    WITH PublisherTotals AS (
      SELECT
        publisher,
        COUNT(DISTINCT title) AS total_books
      FROM books_db.Books
      GROUP BY publisher
    ),
    CategoryAverages AS (
      SELECT
        b.publisher AS publisher,
        b.categories AS category,
        AVG(r.score) AS average_ratings,
        COUNT(DISTINCT b.title) AS books_in_category
      FROM books_db.Books b
      JOIN books_db.Ratings r ON b.id = r.id
      GROUP BY b.publisher, b.categories
    )
    SELECT
      ca.publisher AS publisher,
      ca.category AS category,
      ROUND(ca.books_in_category / pt.total_books, 2) AS volume,
      ROUND(ca.average_ratings / 5.0, 2) AS quality,
      ROUND(0.5 * (ca.books_in_category / pt.total_books) + 0.5 * (ca.average_ratings / 5.0), 2) AS specialization_score
    FROM CategoryAverages ca
    JOIN PublisherTotals pt ON ca.publisher = pt.publisher
    WHERE ca.publisher = '${req.params.publisher}'
    ORDER BY specialization_score DESC
    LIMIT 5
    `, (err, data) => {
      if (err || data.length === 0){
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    })
  }

module.exports = {
  users,
  search_bar,
  random_book,
  author,
  publisher,
  bookpopup,
  genre_publishers,
  publisher_top,
  genre_authors,
  author_top
}
