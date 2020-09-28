// This file used to keep track of users.

const users = [];

// add user
const addUser = (id, info) => {
  // Clean the data
  username = info.username.trim();
  room = info.room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: "A username and room are required.",
    };
  }

  // Make sure the name is unique for that room
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // report error if existing user is true
  if (existingUser) {
    return {
      error: "That username is already in use.",
    };
  }

  // store new user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// remove user
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// get user data
const getUser = id => {
  return (user = users.find(user => user.id === id));
};

// Accept room name and return array of users - user filter method
const getUsersInRoom = room => {
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
