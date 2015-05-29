/**
 * Created by martijnh on 18-5-15.
 */

function loadLeaderBoard() {
    loadJSON('/api/leaderboard/', function (leaderBoardStatistics) {
        leaderBoardStatistics = leaderBoardStatistics.sort(function (a, b) {
            return (b["hexagons"] > a["hexagons"]) ? 1 : ((b["hexagons"] < a["hexagons"]) ? -1 : 0);
        });
        createLeaderBoardTable(leaderBoardStatistics);
    });
}

function createLeaderBoardTable(leaderBoardStatistics) {
    var leaderBoardTable = document.getElementById('leaderBoardTable');

    for (var i = 0; i < leaderBoardStatistics.length; i++) {
        var userRow = leaderBoardTable.insertRow();
        var td = userRow.insertCell(0);
        td.innerText = i + 1; //Rank
        td = userRow.insertCell(1);
        td.innerText = leaderBoardStatistics[i].username;
        td = userRow.insertCell(2);
        td.innerText = leaderBoardStatistics[i].hexagons;
        td = userRow.insertCell(3);
        td.innerText = leaderBoardStatistics[i].observations;
        td = userRow.insertCell(4);
        td.innerText = leaderBoardStatistics[i].projects;
    }
}