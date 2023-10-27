import { useContext } from 'react';
import {
  UserAuthenticationForm,
  ChatPage
} from '@/pages'
import { UserContext } from 'shared';

export default function Routes() {
  const { username, id } = useContext(UserContext)

  if (username) {
    return <ChatPage/>
  }

  return (
    <UserAuthenticationForm/>
  )
}