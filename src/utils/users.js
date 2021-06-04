const users = [];

//add users, remove users get users, getusersInRoom

const addUsers = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) return { error: "Username and room are reqired" };

  // check for existing users
  const existingUsers = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate usernmame
  if (existingUsers) return { error: "Username is in use" };

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeuser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUsers = (id) => {
  return users.find((user) => user.id === id);
};

const getusersInRoom = (room) => {
    room= room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports ={
    addUsers,
    removeuser,
    getUsers,
    getusersInRoom
}