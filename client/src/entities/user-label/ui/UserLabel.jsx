import { Avatar } from '@/entities';

export default function UserLabel({
  selectedUserId,
  setSelectedUserId,
  people,
  userId,
  isOnline
}) {
  return (
    <button
      type="button"
      key={userId}
      className={`
        flex items-center w-full 
        ${userId === selectedUserId ? 'bg-blue-100' : ''}
      `}
      onClick={() => setSelectedUserId(userId)}
    >
      {userId === selectedUserId && (
        <div className="w-1.5 bg-blue-500 h-12 rounded-tr-xl rounded-br-xl"></div>
      )}
      <div className="flex items-center space-x-2 p-3 ml-3">
        <Avatar online={isOnline} username={people[userId]} userId={userId}/>
        <span className="text-gray-800">{people[userId]}</span>
      </div>
    </button>
  )
}