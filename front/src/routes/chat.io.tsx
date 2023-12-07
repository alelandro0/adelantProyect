import React, { useState, useEffect } from 'react';
import { useAuth } from '../Autenticacion/AutProvider';
import './chatClient.css';
import io from 'socket.io-client';
import PortalLayout from '../layout/PortalLayout';
import { ListChat } from './listChat';

const socket = io('http://localhost:5000');

interface Message {
  body: string;
  user: string;
}

export const ChatClient: React.FC = () => {
  const auth = useAuth();
  const [message, setMessage] = useState<string>('');
  const [username, setUsername] = useState<string>(auth.getUser()?.name || '');
  const [listMessages, setListMessages] = useState<Message[]>([
    {
      body: "Bienvenido a nuestro equipo de trabajo",
      user: "Muliservicios",
    },
  ]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    socket.emit('message', { body: message, user: username });

    const newMsg: Message = {
      body: message,
      user: username,
    };

    setListMessages([...listMessages, newMsg]);
    setMessage('');
  };

  useEffect(() => {
    const receiveMessage = (msg: Message) => {
      setListMessages((prevList) => [...prevList, msg]);
      
    };

    socket.on('message', receiveMessage);

    return () => {
      socket.off('message', receiveMessage);
    };
  }, []);

  return (
    <>
      <PortalLayout/>
      <div className="chat">
        <ListChat />
        <div className="molde">
        <div className="div-chat">
          {listMessages.map((message, idx) => (
    <div className={`${
      message.user === username ? 'sent-message' : 'received-message'
    }`}>
      <p key={idx}>
        {message.user}: {message.body}
      </p>
    </div>
    
          ))}
        </div>
        <form onSubmit={handleSubmit} className="formu" id='form'>
          <div className="div-type-chat">
            <input
              value={message}
              placeholder="Type your message"
              onChange={(event) => setMessage(event.target.value)}
              type="text"
              name="text"
              id="chat-message"
              className="input-style"
            />
            <button className='button1' type="submit"></button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
};
