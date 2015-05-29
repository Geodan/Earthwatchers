function loadProjects() {
    loadJSON("data/projects.geojson", function (projects) {
        var projectsTable = document.getElementById("projectsTable");

        for (var i = 0; i < projects.features.length; i++) {
            var project = projects.features[i];

            var projectsRow = projectsTable.insertRow();
            for (var j = 5; j > 0; j--) {
                var td = projectsRow.insertCell(0);
                td.id = project.properties.Name + j;

                if (j === 1) {
                    var link = createProjectLink(project.properties.Name);
                    link.className = "btn btn-lg btn-success";
                    td.appendChild(link);
                }
            }

            setTableCell(project.properties.Name + "2", project.properties.ObservationCategories);

            loadStatistics(project.properties.Name);
        }
    });
}

function createProjectLink(projectName) {
    var url = location.origin + "/#/" + projectName;
    var a = document.createElement("a");
    var linkText = document.createTextNode(projectName);
    a.appendChild(linkText);
    a.href = url;
    return a;
}

function loadStatistics(projectName) {
    loadJSON("/api/statistics/" + projectName, function (projectStatistics) {
        setTableCell(projectStatistics.project + "3", projectStatistics.hexagons.length);
        setTableCell(projectStatistics.project + "4", projectStatistics.users.length);
        setTableCell(projectStatistics.project + "5", projectStatistics.observations);
    });
}

function setTableCell(tableCell, value) {
    var cell = document.getElementById(tableCell);
    cell.innerHTML = value;
}

function loadUserStatistics(projectName, user, hexagons) {
    loadJSON("/api/observations/" + projectName + "/" + user, function (statistics) {
        document.getElementById("hexagonstotal").innerHTML = hexagons;
        document.getElementById("hexagonstatistics").innerHTML = statistics.hexagons;
        document.getElementById("observationstatistics").innerHTML = statistics.observations;
    });
}

