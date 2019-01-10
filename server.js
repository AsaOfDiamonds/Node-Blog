const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./data/helpers/userDb');



const server = express();

//middleware
server.use(morgan('short')); //3rd party logging  yarn add morgan
server.use(helmet()); //3rd party security yarn add helmet
server.use(express.json()); //built-in
server.use(cors()); //3rd party yarn add cors
//custom middleware
function nameUppercase(req, res, next) {
    req.body.name = 
    req.body.name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    next();
}

const checkName = (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        res.status(404).json({ message: 'Name must be included' });
        next();
    } else {
        next();
    }
}

//User routes

const getAllUsers = (req, res) => {
    db.get()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ message: ` Failed to get users`, error: err });
        });
}

const getUser = (req, res) => {
    db.get(req.params.id)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ message: `Failed to get user`, error: err });
        });
}

const addUser = (req, res) => {    
    const { name } = req.body;
    db.insert({ name })
        .then(id => {
            res.status(201).json(id);
        })
        .catch(err => {
            res.status(500).json({ message: `Failed to add user`, error: err });
        });
}

const deleteUser = (req, res) => {
    db.remove(req.params.id)
        .then(usersDeleted => {
            if (usersDeleted > 0) {
                res.status(200).json(usersDeleted);
            } else {
                res.status(404).json({ message: `The user with the specified ID does not exist`, usersDeleted });
            }
        })
        .catch(err => {
            res.status(500).json({ message: `Failed to delete user`, error: err });
        });

}

const updateUser = (req, res) => {
    if (req.body.name === undefined) {
        res.status(400).json({ errorMessage: "Please provide a name for a user." });
        return;
    }
    db.update(req.params.id, req.body)
        .then(userUpdated => {
            if (userUpdated > 0) {
                res.status(200).json({ message: `${userUpdated} user updated` });
            } else {
                res.status(404).json({ message: 'Failed to update user with the specific ID' })
            }
        })
        .catch(err => {
            res.status(500).json({ message: `Internal server error. Could not update user`, error: err });
        });

}

const getPostsOfUser = (req, res) => {
    const { id } = req.params;
    db.getUserPosts(id)
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            res.status(500).json({ message: `Could not find post of user with ${id}`, error: err });
        });
}

//User end points
server.get('/api/users', getAllUsers);
server.get('/api/users/:id', getUser);
server.post('/api/users', checkName, nameUppercase, addUser);
server.delete('/api/users/:id', deleteUser);
server.put('/api/users/:id', check, nameUppercase, updateUser);
server.get('/api/users/:id/posts', getPostsOfUser);




    module.exports = server;