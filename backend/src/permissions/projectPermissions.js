const canUpdateProject = (userId,workspacerole,projectLead)=>{
    if(workspacerole === 'owner'||workspacerole === 'admin'||projectLead.toString()===userId.toString()){
        return true;
    }
    return false;
}

module.exports = {
    canUpdateProject
}