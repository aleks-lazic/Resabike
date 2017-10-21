function updateZone(){
    var id = $("#zone-edit-id").val();
    var name = $("#zone-edit-name").val();

    if(name === "" || name === null)
    {
        errorToast("Veuillez saisir un nom de zone");
        return;
    }

    superagent
        .put("/administration/admin/zone")
        .send({id: id, name: name})
        .end(function(err, res)
        {
            if (err || !res.ok)
            {
                errorToast("Cette zone existe déjà");
            }
            else
            {
                refresh();
                $("#modal-edit-zone").modal('close');
                resetForm("#edit-zone-form");
                successToast("Zone mise à jour");
            }
        });
}

function createZone(){
    var name = $("#zone-add-name").val();

    if(name === "" || name === null)
    {
        errorToast("Veuillez saisir un nom de zone");
        return;
    }

    superagent
        .post("/administration/admin/zone")
        .send({name: name})
        .end(function(err, res)
        {
            if (err || !res.ok)
            {
                errorToast("Cette zone existe déjà");
            }
            else
            {
                refresh();
                $("#modal-add-zone").modal('close');
                resetForm("#add-zone-form");
                successToast("Zone ajoutée");
            }
        });
}

function deleteZone(id){

    superagent
        .delete("/administration/admin/zone/"+id)
        .end(function(err, res)
        {
            if (err || !res.ok)
            {
                errorToast("Erreur interne");
                Materialize.toast("Erreur interne", 2000);
            } else
            {
                refresh();
                successToast("Zone supprimée");
            }
        });
}

function refresh() {
    $("#tab-zones").load(" #tab-zones");
}

function resetForm(selector) {
    $(selector)[0].reset();
}