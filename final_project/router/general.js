const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
    }

    const newUser = { username, password };
    users.push(newUser);

    res.status(201).json({ message: "User successfully registered", user: newUser });

});

const fetchBooks = async () => {
    try {
        const response = await axios.get('https://pranavh2005-6000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
        return response.data;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error; // Propagate the error back
    }
};

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const booksData = await fetchBooks();
        res.send(JSON.stringify(booksData, null, 4));
    } catch (error) {
        res.status(500).send('Cannot fetch books');
    }
});

const fetchBookDetails = async (isbn) => {
    try {
        const response = await axios.get('https://pranavh2005-6000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/${isbn}');
        return response.data; // Assuming API returns book details
    } catch (error) {
        throw new Error(`Failed to fetch book details for ISBN ${isbn}`);
    }
};

// Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const bookDetails = await fetchBookDetails(isbn);
        res.send(JSON.stringify(bookDetails, null, 4));
    } catch (error) {
        res.status(404).send(`Book details not found for ISBN ${isbn}`);
    }
});

const fetchAuthorDetails = async (author) => {
    try {
        const response = await axios.get('https://pranavh2005-6000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${author}');
        return response.data; // Assuming API returns book details
    } catch (error) {
        throw new Error(`Failed to fetch book details for Author ${author}`);
    }
};
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {

  //Write your code here
  const author = req.params.author;
  const bookKeys = Object.keys(books);
  const matchingBooks = [];
  try {
            const authorDetails = await fetchAuthorDetails(author)
    // Iterate through each key and check if the author matches
    bookKeys.forEach(key => {
        if (books[key].author === author) {
        matchingBooks.push(books[key]);
        }
    });
    
    if (matchingBooks.length > 0) {
        res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
        res.status(404).send('No books found for the author');
    }
  }
  catch(error) {
    res.status(404).send(`Book details not found for Author ${author}`);
  }
});


const fetchTitleDetails = async (title) => {
    try {
        const response = await axios.get('https://pranavh2005-6000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/${title}');
        return response.data; // Assuming API returns book details
    } catch (error) {
        throw new Error(`Failed to fetch book details for Title ${title}`);
    }
};
// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);
  const matchingBooks = [];
  try {
    const titleDetails = await fetchTitleDetails(title)
        bookKeys.forEach(key => {
        if (books[key].title === title) {
        matchingBooks.push(books[key]);
        }
    });
  
    if (matchingBooks.length > 0) {
        res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
        res.status(404).send('No books found for the title');
    }
  }
  catch(error) {
    res.status(404).send(`Book details not found for Title ${title}`);
  }                                                
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
    isbn = req.params.isbn;
    const foundBook = books[isbn];

    if (foundBook) {
        res.send(JSON.stringify(foundBook.reviews, null, 4));
    } 
    else {
        res.status(404).send('No reviews found for ISBN ' + isbn);
    }
});

module.exports.general = public_users;
