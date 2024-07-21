const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });

    if (userswithsamename.length > 0) {
        return true;
    } 
    else {
        return false;
    }

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } 
    else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
  if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const username = req.user.username;
    const isbn = req.params.isbn;
    const review = req.body.review;

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} cannot be found` });
    }

    if (!book.reviews[username]) {
    return res.status(404).json({ message: `No review found for ISBN ${isbn}` });
    }
    
    delete book.reviews[username];
    
    return res.status(200).json({ message: `Review deleted for ISBN ${isbn}` });

});

//Delete a review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const username = req.user.username;
    const isbn = req.params.isbn;
    const review = req.body.review;

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (book.reviews.hasOwnProperty(username)) {
    // Modify existing review
        book.reviews[username] = review;
        return res.status(200).json({ message: `Review updated for ISBN ${isbn}` });
    } 
    else {
    // Add new review
        book.reviews[username] = review;
        return res.status(201).json({ message: `Review added for ISBN ${isbn}` });
    }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
