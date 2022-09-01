class PartyGame {
  title = "";
  playerLimit = -1;

  purchase = {
    requiresPurchase: false,
    linkToPurchase: "",
    cost: 0.0,
  };

  constructor(template = undefined) {}
}

class PartyGamesManager {}

module.exports.PartyGames = PartyGamesManager;

//This file is for PartyGame, PartyGameManager, and PartyGameQueue
