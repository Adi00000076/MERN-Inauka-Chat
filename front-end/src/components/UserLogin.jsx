import React, { useState } from 'react';
import { BiLogoMessenger } from "react-icons/bi";
import '../style.css';
import './UserLogin.css';
import _ from 'lodash';
import Infyz from "../assets/images/infyz.jpg";

const UserLogin = ({ setUser }) => {
    const [userName, setUserName] = useState('');

    const handleUser = () => {
        if (!userName) return;
        localStorage.setItem('user', userName);
        setUser(userName);
        localStorage.setItem('avatar', `https://picsum.photos/id/${_.random(1, 1000)}/200/300`);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleUser();
        }
    };

    return (
        <div className='login_container'>
            <div className='login_title'>
                <img src={Infyz} alt="Infyz" className="chats_icon" />
                <BiLogoMessenger className='login_icon' />
                <h2>Chat with</h2> 
                <h1><strong className="animated-heading">Infyz Bot.</strong></h1>
            </div>
            <div className='login_form'>
                <input
                    type="text"
                    placeholder='Enter a Unique Name'
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleUser}>Login</button>
            </div>
        </div>
    );
};

export default UserLogin;
