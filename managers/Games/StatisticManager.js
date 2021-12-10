const Discord = require('discord.js');
const fs = require('fs');

class StatisticManager {
    constructor(gameId, storageMode, client) {
        this.gameId = gameId;
        this.client = client;
        this.statsCache = new Discord.Collection();
        this.storageMode = storageMode;

        this.fetchStats();

    }

    async fetchStats() {
        if (this.storageMode === 'json_local') {
            fs.readFile('Storage/word_scramble_score.json', (err, data) => {
                if (err) throw err;
                let scoreDataJSON = JSON.parse(data);
                for (let userScore of scoreDataJSON) {
                    const user = {
                        score: userScore.score,
                        gamesPlayed: userScore.gamesPlayed,
                        ranking: userScore.ranking
                    }
                    this.statsCache.set(userScore.discordId, user);
                }
            });
        }
    }

    async updateStatsCache(userId, score) {
        let user = this.statsCache.get(userId);
        if (user) {
            user.score = score;
            user.gamesPlayed += 1;
        } else {
            user = {
                score: score,
                gamesPlayed: 1
            };
            this.statsCache.set(userId, user);
        }
    }

    async saveStatsLocal() {
        let scoreDataJSON = [];
        for (let [key, value] of this.statsCache) {
            scoreDataJSON.push({
                discordId: key,
                score: value.score,
                gamesPlayed: value.gamesPlayed
            });
        }
        let data = JSON.stringify(scoreDataJSON, null, 2);

        fs.writeFile('Storage/word_scramble_score.json', data, (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
    }

    async saveStatsMongo() {}

    async globalLeaderboard() {
        
    }

}

module.exports.StatisticManager = StatisticManager;