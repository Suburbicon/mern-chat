export const getOnlinePeople = (people , loggedUsername) => {
  const uniquePeople = {};
  people
    .forEach(({userId, username}) => {
      if (username !== loggedUsername) {
        uniquePeople[userId] = username
      }
    })
  return uniquePeople;
};