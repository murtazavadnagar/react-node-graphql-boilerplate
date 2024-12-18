const { default: axios } = require("axios");

const getPosts = async (page, limit, filter) => {
  const res = await axios("https://jsonplaceholder.typicode.com/posts");
  const { data } = res;
  const filteredPosts = data?.filter(
    (post) =>
      post.title.toLowerCase().includes(filter.toLowerCase()) ||
      post.body.toLowerCase().includes(filter.toLowerCase())
  );
  const startIndex = (page - 1) * limit;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);
  return { paginatedPosts, postsCount: filteredPosts.length };
};

module.exports = {
  getPosts,
};
