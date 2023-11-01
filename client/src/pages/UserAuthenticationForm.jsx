import {useContext, useState} from "react";
import { client, UserContext } from 'shared';

export default function UserAuthenticationForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const {
    setUsername: setLoggedInUsername,
    setId
  } = useContext(UserContext);
  
  const handleSubmit = () => {
    const url = isLogin ? '/login' : '/register'
    client.post(url, {
      username,
      password
    })
      .then(({data}) => {
        setLoggedInUsername(data.username),
        setId(data._id)
      })
      .catch(err => {
        setError(`Username ${err.response.data.username} not found`)
      });
  }

  return (
    <div className="flex items-center bg-green-200 h-screen">
      <form className="mx-auto mb-12 p-6 bg-white rounded-xl shadow-xl">
        {
          error.length ? (
            <div>
              <p className="text-red-500">{error}</p>
            </div>
          ) : ''
        }
        <input
          value={username}
          className="w-full rounded-xl p-2 mb-2 border"
          type="text"
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          value={password}
          className="w-full rounded-xl p-2 mb-4 border"
          type="text"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="border border-blue-500 text-blue-500 w-full rounded-xl p-2"
          type="button"
          onClick={handleSubmit}
        >
          {
            isLogin ? 'Login' : 'Register'
          }
        </button>
        <div className="flex justify-center mt-3">
          {
            !isLogin ? (
              <div className="flex items-center">
                <span className="text-sm">Already a member?</span>
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="ml-2 px-2 py-1 bg-blue-400 text-sm text-white rounded-xl"
                >Login here</button>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-sm">Dont have an account?</span>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="ml-2 px-2 py-1 bg-blue-400 text-sm text-white rounded-xl"
                >
                  Register
                </button>
              </div>
            )
          }
        </div>
      </form>
    </div>
  )
}