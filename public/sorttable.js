window.onload = function() {
  const gameData = document.getElementById("gameData");
  if (!gameData) {
    console.error("The gameData element was not found on the page");
    return;
  }
  const headers = gameData.getElementsByTagName("th");
  for (const header of headers) {
    header.addEventListener("click", function() {
      const property = header.dataset.property;
      const isAscending = header.dataset.order === "asc";
      const tbody = gameData.getElementsByTagName("tbody")[0];
      const rows = Array.from(tbody.rows);
      rows.sort((a, b) => {
        const aValue = a.cells[property].innerHTML;
        const bValue = b.cells[property].innerHTML;
        if (aValue === bValue) {
          return 0;
        }
        if (isAscending) {
          return aValue < bValue ? -1 : 1;
        }
        return aValue > bValue ? -1 : 1;
      });
      header.dataset.order = isAscending ? "desc" : "asc";
      tbody.innerHTML = "";
      for (const row of rows) {
        tbody.appendChild(row);
      }
    });
  }
  fetch('game.json')
    .then(response => response.json())
    .then(data => {
      for (const game of data) {
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.innerHTML = game.id;
        row.appendChild(idCell);
        const nameCell = document.createElement("td");
        nameCell.innerHTML = game.name;
        row.appendChild(nameCell);
        const genreCell = document.createElement("td");
        genreCell.innerHTML = game.genre || "N/A";
        row.appendChild(genreCell);
        gameData.appendChild(row);
      }
    });
};