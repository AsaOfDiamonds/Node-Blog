const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dbUser = require('./data/helpers/userDb');
const dbPosts = require('./data/helpers/postDb');




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
    dbUser.get()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ message: ` Failed to get users`, error: err });
        });
}

const getUser = (req, res) => {
    dbUser.get(req.params.id)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ message: `Failed to get user`, error: err });
        });
}

const addUser = (req, res) => {    
    const { name } = req.body;
    dbUser.insert({ name })
        .then(id => {
            res.status(201).json(id);
        })
        .catch(err => {
            res.status(500).json({ message: `Failed to add user`, error: err });
        });
}

const deleteUser = (req, res) => {
    dbUser.remove(req.params.id)
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
    dbUser.update(req.params.id, req.body)
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
    dbUser.getUserPosts(id)
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
server.put('/api/users/:id', checkName, nameUppercase, updateUser);
server.get('/api/users/:id/posts', getPostsOfUser);


//Post routes

const getAllPosts = (req, res) => {
    dbPosts.get()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            res.status(500).json({ message: 'Failed to get posts.', error: err });
        });
}

const getPostById = (req, res) => {
    dbPosts.get(req.params.id)
        .then(post => {
            console.log(post)
            if (post.length !== 0) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: `Failed to get post with specific ID: ${req.params.id} does not exist` });
            }
        })
        .catch(err => {
            res.status(500).json({ message: `The post with id: ${req.params.id} could not be retrieved.`, error: err });
        });
}

const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const recordsDeleted = await dbPosts.remove(id);
        if (recordsDeleted > 0) {
            res.status(200).json(recordsDeleted);
        } else {
            res.status(404).json({ message: `Failed to delete post, post does not exist`});
        }
    } catch (err) {
        res.status(500).json({ message: "The post could not be removed", err });
    }
}

const addNewPost = (req, res) => {
    if (req.body.userId === undefined || req.body.text === undefined) {
        res.status(400).json({ message: "Title and contents for the post are required." });
        return;
    }

    dbPosts.insert(req.body)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ message: "Failed to save post", error: err });
        });
}

const updatePost = (req, res) => {
    if (req.body.text === undefined) {
        res.status(400).json({ message: "Title and contents for the post are required." });
        return;
    }

    dbPosts.update(req.params.id, req.body)
        .then(count => {
        if (count > 0) {
            dbPosts.get(req.params.id)
            .then(post => {                
                if ((post.hasOwnProperty('length') && post.length > 0)) {
                    res.status(200).json(post);
                } else {
                    res.status(404).json({ message: `Failed to find post with the specified ID ${req.params.id}.` })
                }
            });
        } else {
            res.status(404).json({
                message: `The post with the specified ID ${req.params.id} does not exist.`
            })
        }
    })
        .catch(err => {
            res.status(500).json({ message: 'Failed to update post', error: err });
        });
}

//Post end points
server.get('/api/posts', getAllPosts); //'/api/posts'
server.get('/api/posts/:id', getPostById);
server.post('/api/posts', addNewPost);
server.delete('/api/posts/:id', deletePost);
server.put('/api/posts/:id', updatePost);





    module.exports = server;