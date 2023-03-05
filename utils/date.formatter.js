module.exports = {
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  },
};
