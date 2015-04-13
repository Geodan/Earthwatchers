function styleButton(button,checked){
    console.log(button);
    if(checked){
        button.style.border='5px solid black';
    }
    else{
        button.style.border='0px solid black';
    }
}

function addCategoryButton(buttonsDiv, category){
    var btn = document.createElement("BUTTON");
    btn.className = 'button';
    btn.innerText=category;
    btn.id=category;
    btn.addEventListener("click", function(){setCategory(category)},false);
    var btnNext = document.getElementById('btnNext');
    buttonsDiv.insertBefore(btn,btnNext);
}

function addCategoryButtons(categories, types){
    var buttonsDiv = document.getElementById("buttons");

    for (var i = 0; i < categories.length; i++) {
        for (var j= 0; j < types.length; j++)
        {
            if (types[j].type === categories[i]){
                addCategoryButton(buttonsDiv, types[j].name);
            }
        }
        //TODO fallback projectType not found...
    }
}

function styleCategoryButtons(categories,category){
    for (var i = 0; i < categories.length; i++) {
        var btn=document.getElementById(categories[i]);
        styleButton(btn,categories[i]===category);
    }
}

