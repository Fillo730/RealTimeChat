const users = [];

function addUser(id, username, room) {
    const user = { id, username, room };
    users.push(user);
    return user;
}

function getUserById(id) {
    return users.find(user => user.id === id);
}

function removeUser(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
    return null;
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    getUserById,
    users,
    removeUser,
    getRoomUsers
};