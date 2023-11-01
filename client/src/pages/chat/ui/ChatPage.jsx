import { useContext, useEffect, useRef, useState } from "react";
import { uniqBy } from 'lodash';
import { client, UserContext } from 'shared';
import {
  Logo,
  MessageComponent,
  UserLabel
} from '@/entities';
import { getOnlinePeople } from '../lib';
import InputComponent from './InputComponent.jsx';

export default function ChatPage() {
  const [ws, setWs] = useState(null);
  const [onlinePeople,setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const {
    username: loggedUsername,
    id: loggedId,
    setId: setLoggedId,
    setUsername: setLoggedUsername
  } = useContext(UserContext);

  const divUnderMessages = useRef();

  const connectToWs = () => {
    const ws = new WebSocket('ws://localhost:4000');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect');
        connectToWs();
      }, 1000);
    });
  };

  useEffect(() => {
    connectToWs();
  }, []);

  const handleMessage = (event) => {
    const messageData = JSON.parse(event.data);
    if (messageData.hasOwnProperty('online')) {
        setOnlinePeople(getOnlinePeople(messageData.online, loggedUsername));
    } else if (messageData.hasOwnProperty('text')) {
      if (messageData.sender === selectedUserId) {
        setMessages(prev => (uniqBy([...prev, {...messageData}], '_id')));
      }
    }
  };

  useEffect(() => {
    client.get('/people')
      .then(({ data }) => {
        const offlinePeople = data
          .filter(p => p._id !== loggedId)
          .filter(p => !Object.keys(onlinePeople).includes(p._id));
        setOfflinePeople(offlinePeople.reduce((acc, val) => {
          acc[val._id] = val.username;
          return acc
        }, {}));
      })
  }, [onlinePeople]);

  useEffect(() => {
    const divBox = divUnderMessages.current;
    if (divBox) {
      divBox.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
    }
  }, [messages]);

  const sendMessage = (event, file = null) => {
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText,
      file
    }));
    if (file) {
      client.get(`/messages/${selectedUserId}`)
        .then(({ data }) => {
          setMessages(data)
        })
        .catch(err => console.log(err))
    } else {
      setNewMessageText('');
      setMessages(prev => [...prev, {
        sender: loggedId,
        recipient: selectedUserId,
        text: newMessageText,
        _id: Date.now()
      }]);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      client.get(`/messages/${selectedUserId}`)
        .then(({ data }) => {
          setMessages(data)
        })
        .catch(err => console.log(err))
    }
  }, [selectedUserId]);

  const sendFile = (event) => {
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        data: reader.result,
        name: event.target.files[0].name
      });
    };
  }

  const logout = () => {
    client.post('/logout')
      .then(() => {
        setWs(null);
        setLoggedId(null);
        setLoggedUsername(null);
      })
      .catch(err => console.log(err))
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-1/3 bg-white">
        <div className="flex-grow">
          <Logo/>
          <div className="divide-y">
            {
              onlinePeople && Object.keys(onlinePeople).map(userId => (
                <UserLabel
                  key={userId}
                  userId={userId}
                  setSelectedUserId={setSelectedUserId}
                  selectedUserId={selectedUserId}
                  people={onlinePeople}
                  isOnline={true}
                />
              ))
            }
            {
              offlinePeople && Object.keys(offlinePeople).map(userId => (
                <UserLabel
                  key={userId}
                  userId={userId}
                  setSelectedUserId={setSelectedUserId}
                  selectedUserId={selectedUserId}
                  people={offlinePeople}
                  isOnline={false}
                />
              ))
            }
          </div>
        </div>
        <div className="flex items-center justify-center p-2">
          <div className="flex mr-4 text-lg text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            : {loggedUsername}
          </div>
          <button
            type="button"
            className="text-sm text-gray-400 bg-blue-100 py-1.5 px-3 rounded-xl"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col w-2/3 p-2 bg-blue-100">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <p className="text-lg text-gray-400">&larr; Select a person from sidebar</p>
            </div>
          )}
          {selectedUserId && (
            <div className="relative h-full">
              <div className="absolute top-0 left-0 right-0 bottom-2 flex flex-col justify-end">
                <div className="space-y-2 overflow-y-scroll">
                  {messages.map((message) => (
                    <MessageComponent
                      key={message._id}
                      message={message}
                      loggedId={loggedId}
                    />
                  ))}
                  <div ref={divUnderMessages}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <InputComponent
            sendMessage={sendMessage}
            newMessageText={newMessageText}
            setNewMessageText={setNewMessageText}
            sendFile={sendFile}
          />
        )}
      </div>
    </div>
  )
}