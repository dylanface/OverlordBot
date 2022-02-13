/**
 * Cache with a user's game stats.
 */
 class UserGameStats {

    /**
     * An array of score objects for this user game stat manager.
     */
    cache = [];

    /**
     * The game this UserGameStat manager is for.
     */
    gameType = '';
    
    /**
     * The last time this UserGameStat manager was updated.
     */
    lastUpdated;

    constructor(gameType) {
        this.gameType = gameType;

    }


}

module.exports = UserGameStats;