import { UserContextProvider, UserContext } from 'shared';
import Routes from '@/app/routes/Routes.jsx';

function App() {
  return (
    <div>
      <UserContextProvider>
        <Routes/>
      </UserContextProvider>
    </div>
  )
}

export default App
