let users = [];

function addUser({ id, name, room }) {
  if (!name || !room) {
    return { error: "Username or room is missing" };
  }
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const userAlreadyExists = users.find(
    (user) => user.room === room && user.name === name
  );

  if (userAlreadyExists)
    return { error: "Someone is already using this username in this room" };

  const user = { id, name, room };
  users.push(user);
  return { user };
}

function getUser(id) {
  return users.find((user) => user.id === id);
}

function removeUser(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getUsersInRoom(room) {
  return users.filter((user) => user.room === room);
}

module.exports = { addUser, getUser, removeUser, getUsersInRoom };
