import {
  createContext,
  useEffect,
  useState
} from 'react';
import { client } from 'shared';

export const UserContext = createContext({});

export function UserContextProvider ({children}) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    client.get('/profile')
      .then(({data}) => {
        setUsername(data.username)
        setId(data.userId)
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      { isLoading ? '' : children}
    </UserContext.Provider>
  )
};