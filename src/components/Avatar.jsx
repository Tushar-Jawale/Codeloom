import React from 'react';
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
import './Avatar.css';

const Avatar = ({ username, size = 40 }) => {
    const avatar = createAvatar(initials, {
        seed: username,
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9'],
        radius: 50
    });

    const svg = avatar.toString();

    const style = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        display: 'block',
        marginRight: '10px'
    };

    return (
        <div className="avatar-wrapper">
            <img 
                src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
                alt={`${username}'s avatar`}
                style={style}
            />
        </div>
    );
};

export default Avatar; 