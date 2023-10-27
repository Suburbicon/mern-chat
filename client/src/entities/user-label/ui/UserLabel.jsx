import { Avatar } from '@/entities';

export default function UserLabel({
  selectedUserId,
  setSelectedUserId,
  onlinePeople,
  userId
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
        <Avatar username={onlinePeople[userId]} userId={userId}/>
        <span className="text-gray-800">{onlinePeople[userId]}</span>
      </div>
    </button>
  )
}