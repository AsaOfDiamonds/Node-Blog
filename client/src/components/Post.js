import React from 'react';

const Post = props => {
    return (
        <div className="post">
            <h2>{props.text}</h2>
            <p>{props.id}</p>
            <p>{props.userId} </p>
        </div>
    );
};

Post.defaultProps = {
    text: '',
    id: '',
    userId: ''
};

export default Post;

