export default function Avatar({username, userId, online}) {
  const colors = [
    'bg-red-200', 'bg-green-200', 'bg-purple-200',
    'bg-blue-200', 'bg-yellow-200', 'bg-teal-200',
  ];
  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  return (
    <div
      className={"relative flex items-center justify-center w-8 h-8 text-white4 rounded-full shadow-lg " + color}
    >
      <span className="uppercase">{username[0]}</span>
      {online &&
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
      }
      {!online &&
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border border-white rounded-full"></div>
      }
    </div>
  )
}