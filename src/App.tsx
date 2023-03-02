import { useState, KeyboardEvent, useMemo } from 'react'
import { useGithub } from './useGithub'
import { User } from './User'
import './App.css'

function App() {
  const { users, loading, error, commonUsers, appendUser, deleteUser } = useGithub()
  const [addUser, setAddUser] = useState(false)

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    setAddUser(false);
    appendUser(event.currentTarget.value)
  }

  // compute user elements
  const usersComponents = useMemo(() => {
    const names = Object.keys(users);
    return names.map((name, i) =>
      <User
        key={name}
        data={users[name]?.info}
        onEdit={(newName) => {
          deleteUser(name)
          appendUser(newName)
        }}
        // set to removable if there are more than 2 users
        removable={names.length > 2}
        onRemove={() => deleteUser(name)} />
    )
  }, [users])

  // compute common followers elements
  const followersCompoenents = useMemo(() => {
    return commonUsers.map(user => <User
      key={user.id.toString()}
      data={user}
      onEdit={(newName) => {
        deleteUser(user.login)
        appendUser(newName)
      }} />)
  }, [commonUsers])


  return (
    <div >
      <h1>Samvel Avanesov - SRTX/Demo</h1>
      <h2> 2022 - Software Interview Code Demonstration - Front-End</h2>
      <h3>Built with: vite, react, tailwind, typescript</h3>
      <p>Followers must follow all of the users</p>
      <div  >
        <div className={'display'}>
          {
            <div className={'users'}>
              <p className='title'>Users: {usersComponents.length}</p>
              <div>
                {usersComponents}
                {/* add user input field if addUser is true */}
                {addUser && <input type="text"
                  placeholder="Enter Username"
                  autoFocus={true}
                  onKeyDownCapture={onKey}
                  onBlur={() => setAddUser(false)} />}
                {/* add button to add user */}
                {!addUser && <button onClick={() => setAddUser(true)}>Add user</button>}
              </div>
            </div>
          }
          {
            <div className={'users'}>
              <p className='title'>Common followers: {followersCompoenents.length}</p>
              <div>{followersCompoenents}</div>
            </div>
          }
        </div>

        {loading && <p className='loading'>Loading...</p>}
        {error && <p className='error'>{error}!</p>}
      </div>
    </div>
  )
}

export default App
