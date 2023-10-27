export default function Avatar({username, userId}) {
  const colors = [
    'bg-red-200', 'bg-green-200', 'bg-purple-200',
    'bg-blue-200', 'bg-yellow-200', 'bg-teal-200',
  ];
  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  return (
    <div
      className={"flex items-center justify-center w-8 h-8 text-white4 rounded-full " + color}
    >
      <span className="uppercase">{username[0]}</span>
    </div>
  )
}