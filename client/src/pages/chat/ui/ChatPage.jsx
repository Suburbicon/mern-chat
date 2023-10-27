import { useContext, useEffect, useRef, useState } from "react";
import { uniqBy } from 'lodash';
import { client, UserContext } from 'shared';
import { Logo, UserLabel } from '@/entities';
import { getOnlinePeople } from '../lib';

export default function ChatPage() {
  const [ws, setWs] = useState(null);
  const [onlinePeople,setOnlinePeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const { username: loggedUsername, id: loggedId } = useContext(UserContext);

  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  const connectToWs = () => {
    const ws = new WebSocket('ws://localhost:4000');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => () => {
      setTimeout(() => {
        connectToWs();
      }, 1000)
    });
  };

  const handleMessage = (event) => {
    const messageData = JSON.parse(event.data);
    if (messageData.hasOwnProperty('online')) {
      setOnlinePeople(getOnlinePeople(messageData.online, loggedUsername));
    } else if (messageData.hasOwnProperty('text')) {
      setMessages(prev => (uniqBy([...prev, {...messageData}], '_id')));
    }
  };

  useEffect(() => {
    const divBox = divUnderMessages.current;
    if (divBox) {
      divBox.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
    }
  }, [messages]);

  const sendMessage = () => {
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText
    }));
    setNewMessageText('');
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

  return (
    <div className="flex h-screen">
      <div className="w-1/3 bg-white">
        <Logo/>
        <div className="divide-y">
          {
            Object.keys(onlinePeople).map(userId => (
              <UserLabel
                key={userId}
                userId={userId}
                setSelectedUserId={setSelectedUserId}
                selectedUserId={selectedUserId}
                onlinePeople={onlinePeople}
              />
            ))
          }
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
                  {messages.map((message,id) => (
                    <div
                      key={message+id}
                      className={
                        `flex ${message.sender === loggedId ? 'justify-end' : 'justify-start'}`
                      }
                    >
                      <div className="max-w-[50%]">
                        <div
                          key={message+id}
                          className={
                            `p-2 text-white rounded-xl whitespace-normal
                        ${message.sender === loggedId ? 'bg-green-400' : 'bg-blue-400'}`
                          }
                        >
                          <p className="break-words">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={divUnderMessages}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <div className="flex gap-2 mt-4">
            <input
              value={newMessageText}
              type="text"
              placeholder="Type your message here"
              className="flex-grow bg-white border p-2 rounded-xl"
              onChange={e => setNewMessageText(e.target.value)}
            />
            <button
              className="bg-blue-500 p-2 text-white rounded-xl"
              type="button"
              onClick={sendMessage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}