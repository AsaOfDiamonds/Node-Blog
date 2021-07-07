import React, { Component } from 'react';
import Posts from "./components/Posts";
import axios from "axios";
import { Route,} from "react-router-dom";

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
    };
  }

  componentDidMount() {
    axios
      .get('http://localhost:5000/api/posts')
      .then(response => {
        console.log(response.data);
        this.setState({
          posts: response.data
        });
      })
      .catch(err => console.log(err));
  }

updatePosts = posts => {
  this.setState({posts})
}







  render() {    
    return (
      <div className="App">
        <h1>This is the Node-Blog App</h1>
        <Route
          exact path='/api/posts'
          render={(props) => (
            <Posts {...props} posts={this.state.posts} />
          )}
        />
      </div>
    );
  }
}

export default App;
