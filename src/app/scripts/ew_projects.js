function getProjectByName(projects, name){
    var result=null;
    for(var p=0;p<projects.features.length;p++){
        var project = projects.features[p];
        if(project.properties.Name === name){
            result=project;
            break;
        }
    }
    return result;
}
