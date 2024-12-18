const { default: axios } = require("axios");

const getUsers = async () => {
  const res = await axios.get("https://jsonplaceholder.typicode.com/users");
  return res.data;
};

module.exports = {
  getUsers,
};
