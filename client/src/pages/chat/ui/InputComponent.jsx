export default function InputComponent({
  newMessageText,
  setNewMessageText,
  sendMessage,
  sendFile
}) {
  return (
    <div className="flex gap-2 mt-4">
      <label
        className="p-2 cursor-pointer"
      >
        <input
          type="file"
          className="hidden"
          onChange={sendFile}
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        </svg>
      </label>
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
  )
}