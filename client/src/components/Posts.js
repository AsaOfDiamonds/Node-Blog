import React, { Component } from 'react';

import Post from './Post';

class Posts extends Component {
    render() {
        return (
            <div className="posts">
                <h1>LOTR</h1>
                <ul>
                    {this.props.posts.map(post => {
                        return (
                            <Post
                                text={post.text}                                
                                userId={post.userId}                                
                                key={post.id}
                            />
                        );
                    })}
                </ul>
            </div>
        );
    }
}

Post.defaultProps = {
    posts: [],
};

export default Posts;