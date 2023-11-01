import { client } from 'shared';

export default function Message({
  message,
  loggedId
}) {
  return (
    <div
      key={message._id}
      className={
        `flex ${message.sender === loggedId ? 'justify-end' : 'justify-start'}`
      }
    >
      <div className="max-w-[50%]">
        <div
          className={
            `p-2 text-white rounded-xl whitespace-normal
            ${message.sender === loggedId ? 'bg-green-400' : 'bg-blue-400'}`
          }
        >
          <p className="break-words">
            {message.text}
            {message.file && (
              <a
                href={`${client.defaults.baseURL}/uploads/${message.file}`}
                className="underline"
              >{message.file}</a>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}