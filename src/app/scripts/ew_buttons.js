function styleButton(button,checked){
    if(checked){
        button.style.border='5px solid black';
    }
    else{
        button.style.border='0px solid black';
    }
}

function addCategoryButton(buttonsDiv, type){
    var btn = document.createElement("BUTTON");
    btn.className = 'button';
    btn.innerText = type.name;
    btn.id = type.type;
    btn.style.backgroundImage = "url('images/" + type.icon +"')";
    btn.style.backgroundRepeat =  "no-repeat";
    btn.style.backgroundSize = "20px";
    btn.style.color = "#0000ff";
    btn.addEventListener("click", function(){setCategory(type.type)},false);
    var btnNext = document.getElementById('btnNext');
    buttonsDiv.insertBefore(btn,btnNext);
}

function addCategoryButtons(categories, types){
    var buttonsDiv = document.getElementById("buttons");

    for (var i = 0; i < categories.length; i++) {
        for (var j= 0; j < types.length; j++)
        {
            if (types[j].type === categories[i]){
                addCategoryButton(buttonsDiv, types[j]);
            }
        }
        //TODO fallback projectType not found...
    }
}

function styleCategoryButtons(categories,category){
    for (var i = 0; i < categories.length; i++) {
        var btn = document.getElementById(categories[i]);
        styleButton(btn, categories[i] === category);
    }
}

