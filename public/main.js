let allPlayers = [];
let comparePlayers = [];
let currentStat = null;


async function loadPlayers() {
    try {
      const [passingStats, rushingStats, receivingStats] = await Promise.all([
        fetch("data/passing.json"),
        fetch("data/rushing.json"),
        fetch("data/receiving.json")
      ]);
  
      const passing = await passingStats.json();
      const rushing = await rushingStats.json();
      const receiving = await receivingStats.json();
  
      const qbs = passing.filter(player => player.Pos === 'QB'); 
      const rbs = rushing.filter(player => player.Pos === 'RB'); 
      const wrsTes = receiving.filter(player => player.Pos === 'WR' || player.Pos === 'TE');
     
      allPlayers = [...qbs, ...rbs, ...wrsTes];

    showPlayers(allPlayers);
  } catch (error) {
    console.error("Error loading players:", error);
  }
  }
  
  function getStatsForPlayer(player) {
    if (player.Pos == "QB") {
        return `Yards: ${player.Yds} | TD: ${player.TD} | INT: ${player.Int}`;
    } else if (player.Pos == "RB") {
        return `Rush Yds: ${player.Yds} | TD: ${player.TD} | Att: ${player.Att}`;
    } else if (player.Pos == "WR" || player.Pos == "TE") {
        return `Rec Yds: ${player.Yds} | TD: ${player.TD} | Rec: ${player.Rec}`;
    }
}

function showPlayers(list) {
  const display = document.getElementById("playerList");
  const model = document.getElementById("playerCardModel");

  display.innerHTML = "";

  list.forEach(p => {
    const card = model.cloneNode(true);
    card.classList.remove("hidden");

    card.querySelector(".player-name").textContent = p.Player;
    card.querySelector(".player-data").textContent = `${p.Team} • ${p.Pos}`;
    const statsEl = card.querySelector(".player-stats");

if (currentStat === "PassYds") {
  statsEl.textContent = `Passing Yards: ${p.Yds}`;

} else if (currentStat === "PassTD") {
  statsEl.textContent = `Passing TDs: ${p.TD}`;

} else if (currentStat === "RushYds") {
  statsEl.textContent = `Rushing Yards: ${p.Yds}`;

} else if (currentStat === "RushTD") {
  statsEl.textContent = `Rushing TDs: ${p.TD}`;

} else if (currentStat === "RecYds") {
  statsEl.textContent = `Receiving Yards: ${p.Yds}`;

} else if (currentStat === "RecTD") {
  statsEl.textContent = `Receiving TDs: ${p.TD}`;
} else if (currentStat === "Int") {
  statsEl.textContent = `Int: ${p.Int ?? 0}`;
} else if (currentStat === "Fmb") {
    statsEl.textContent = `Fumbles: ${p.Fmb ?? 0}`;
} else {
  statsEl.textContent = getStatsForPlayer(p);
}


    card.querySelector(".compare-button").onclick = () => addToCompare(p.Player);

    display.appendChild(card);
  });
}

function addToCompare(name) {
  const player = allPlayers.find(p => p.Player === name);
  if (!player) return;

  if (!comparePlayers.includes(player)) {
    comparePlayers.push(player);
    showCompare();
  }
}

function showCompare() {
  const display = document.getElementById("compareList");
  const model = document.getElementById("compareCardModel");

  display.innerHTML = "";

  comparePlayers.forEach(p => {
    const card = model.cloneNode(true);
    card.classList.remove("hidden");

    card.querySelector(".compare-name").textContent = p.Player;
    card.querySelector(".compare-data").textContent = `${p.Team} • ${p.Pos}`;
    card.querySelector(".compare-yds").textContent = `Yards: ${p.Yds ?? "N/A"}`;
    card.querySelector(".compare-td").textContent = `TD: ${p.TD ?? "N/A"}`;

    card.querySelector(".remove-button").onclick = () =>
      removeCompare(p.Player);

    display.appendChild(card);
  });
}

function removeCompare(name) {
  comparePlayers = comparePlayers.filter(p => p.Player !== name);
  showCompare();
}



// QUICK NOTE!!!!!!!!!!!!!!
// Here, Once i added my filters and the applyFilters() method, my page stopped displaying all the players and was just the outline.
// So, I asked chatGPT and was told "wrap your event bindings in a DOMContentLoaded block" So it put all of them in this. Sorry, I only
// used it for this part though, and only for this bug I could not fix.
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("positionFilter").addEventListener("change", applyFilters);
  document.getElementById("statsFilter").addEventListener("change", applyFilters);

  document.getElementById("playersTab").onclick = () => {
    document.getElementById("players").classList.remove("hidden");
    document.getElementById("compare").classList.add("hidden");
  };

  document.getElementById("compareTab").onclick = () => {
    document.getElementById("players").classList.add("hidden");
    document.getElementById("compare").classList.remove("hidden");
  };

  loadPlayers();
});


function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const pos = document.getElementById("positionFilter").value;
  const stat = document.getElementById("statsFilter").value;

  let filtered = allPlayers.filter(p =>
    p.Player.toLowerCase().includes(search)
  );

  if (pos) {
    filtered = filtered.filter(p => p.Pos === pos);
  }

  currentStat = null;
  if (stat === "Passing Yards") {
    filtered = filtered
      .filter(p => p.Pos === "QB")
      .sort((a, b) => b.Yds - a.Yds);
    currentStat = "PassYds";

  } else if (stat === "Passing Touchdowns") {
    filtered = filtered
      .filter(p => p.Pos === "QB")
      .sort((a, b) => b.TD - a.TD);
    currentStat = "PassTD";

  } else if (stat === "Rushing Yards") {
    filtered = filtered
      .filter(p => p.Pos === "RB")
      .sort((a, b) => b.Yds - a.Yds);
    currentStat = "RushYds";

  } else if (stat === "Rushing Touchdowns") {
    filtered = filtered
      .filter(p => p.Pos === "RB")
      .sort((a, b) => b.TD - a.TD);
    currentStat = "RushTD";

  } else if (stat === "Receiving Yards") {
    filtered = filtered
      .filter(p => p.Pos === "WR" || p.Pos === "TE")
      .sort((a, b) => b.Yds - a.Yds);
    currentStat = "RecYds";
  } else if (stat === "Receiving Touchdowns") {
    filtered = filtered
      .filter(p => p.Pos === "WR" || p.Pos === "TE")
      .sort((a, b) => b.TD - a.TD);
    currentStat = "RecTD";
  } else if (stat === "Interceptions Thrown") {
    filtered = filtered
      .filter(p => p.Pos === "QB")
      .sort((a, b) => b.Int - a.Int);
    currentStat = "Int";
  } else if (stat === "Fumbles") {
    filtered = filtered
      .filter(p => p.Pos === "RB" || p.Pos === "WR" || p.Pos === "TE")
      .sort((a, b) => b.Fmb - a.Fmb);
    currentStat = "Fmb";
  }

  showPlayers(filtered);
}

document.getElementById("playersTab").onclick = () => {
  document.getElementById("players").classList.remove("hidden");
  document.getElementById("compare").classList.add("hidden");
};

document.getElementById("compareTab").onclick = () => {
  document.getElementById("players").classList.add("hidden");
  document.getElementById("compare").classList.remove("hidden");
};

loadPlayers();
