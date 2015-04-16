function styleButton(button,checked){
    if(checked){
        button.style.border='5px solid black';
    }
    else{
        button.style.border='1px solid black';
    }
}

function addObservationTypeButton(buttonsDiv, type){
    var btn = document.createElement("BUTTON");
    btn.id = type.type;
    btn.innerText = type.name;
    btn.className = 'button';
    btn.style.backgroundImage = "url('images/" + type.icon +"')";
    btn.style.backgroundRepeat =  "no-repeat";
    btn.style.backgroundSize = "20px";
    btn.style.color = "#0000ff";
    btn.addEventListener("click", function(){setObservationType(type)},false);
    var btnNext = document.getElementById('btnNext');
    buttonsDiv.insertBefore(btn,btnNext);
}

function addObservationTypeButtons(categories, types){
    var buttonsDiv = document.getElementById("buttons");

    for (var i = 0; i < categories.length; i++) {
        for (var j= 0; j < types.length; j++)
        {
            if (types[j].type === categories[i]){
                addObservationTypeButton(buttonsDiv, types[j]);
                //set the first button as default
                if (i === 0) {
                    selectedObservationType = types[j];
                }
            }
        }
        //TODO fallback projectType not found...
    }
    setObservationType(selectedObservationType);
}

function styleObservationTypeButtons(observationTypes,selectedObservation){
    for (var i = 0; i < observationTypes.length; i++) {
        var btn = document.getElementById(observationTypes[i]);
        styleButton(btn, observationTypes[i] === selectedObservation);
    }
}

