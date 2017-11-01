$(document).ready(function(){
    $('.add-lines').on("click", function(e){
        var id = $(this).data('id');
        e.stopPropagation();


        $('.modal#modal-add-line').modal({
            ready: function(modal, trigger) {
                modal.find('input[id="line-add-idZone"]').val(id);
                Materialize.updateTextFields();
            }
        });
        $('.modal#modal-add-line').modal('open');
    });

    $('.modal#modal-edit-user').modal({
        ready: function(modal, trigger) {
            modal.find('input[id="user-edit-id"]').val(trigger.data('id'));

            modal.find('input[id="user-edit-username"]').val(trigger.data('username'));
            modal.find('input[id="user-edit-email"]').val(trigger.data('email'));
            modal.find('select[id="user-edit-role"]').val(trigger.data('idrole'));
            $('select[id="user-edit-role"]').material_select();
            modal.find('select[id="user-edit-zone"]').val(trigger.data('idzone'));
            $('select[id="user-edit-zone"]').material_select();
            Materialize.updateTextFields();


        }
    });

    $('#collapsible-list-zones-lines').searchIt({
        useMaterializeCollapsible:true,
        headerIdentifier: '.collapsible-header',
        itemSelector:'tbody tr',
        searchTemplate: '<div class="input-field">' +
        '<input id="search" type="search">' +
            '<label for="search" class="label-icon"><i class="material-icons">search</i></label>' +
        '<i class="material-icons close-search" data-target="search">close</i>'+
        '</div>'

    })

    $('.input-field i.close-search').click(function () {
        $(this).parent(".input-field").children("input[type=search]").val('');
    });

    $('.tap-target').tapTarget('open');






});

function updateUser(){
    var id = $("#user-edit-id").val();
    var username = $("#user-edit-username").val();
    var email = $("#user-edit-email").val();
    var chpassword = $("#user-edit-chpassword").val();
    var chpassword2 = $("#user-edit-chpassword2").val();
    var idRole = $("#user-edit-role").val();
    var idZone = $("#user-edit-zone").val();

    if($("#edit-user-form").valid())
        superagent
            .put("/administration/admin/users")
            .send({id: id, email: email, chpassword:chpassword,idRole:idRole,idZone:idZone})
            .end(function(err, res)
            {

                if (err || !res.ok)
                {
                    errorToast("Cet user existe déjà");
                }
                else
                {
                    refreshUsers();
                    $("#modal-edit-user").modal('close');
                    resetForm("#edit-user-form");
                    successToast("User mise à jour");
                }
            });
}

function createLine(){
    var idZone = $("#line-add-idZone").val();
    var departure = $("#line-add-departure").val();
    var terminal = $("#line-add-terminal").val();

    if($("#add-line-form").valid())
        superagent
            .post("/administration/admin/lines")
            .send({
                idZone: idZone,
                departure: departure,
                terminal: terminal
            })
            .end(function (err, res) {
                if (err || !res.ok)
                {
                    if(err.status === 503)
                    {
                        var li = "";
                        for(var i = 0; i < res.body.length; i++)
                        {
                            li += "<li class='collection-item'>"+res.body[i][0]+" "+res.body[i][1]+"</li>";

                        }
                        $("#modal-add-line").modal('close');
                        $('#suggestions-lines').empty();
                        $('#suggestions-lines').append(li);
                        $('#modal-suggestions-line').modal("open");
                        console.log(res.body);
                        successToast("yeah");
                    }
                    else if(res.body == false)
                        errorToast("Cette ligne appartient déjà à une autre zone");
                    else
                        errorToast("Ligne introuvable");
                }
                else
                {
                    refreshZoneLine(idZone);
                    $("#modal-add-line").modal('close');
                    resetForm("#add-line-form");
                    successToast("Ligne ajoutée");

                }
            });
    else
        errorToast("Veuillez bien à remplir le formulaire");
}

function deleteLine(id, idZone){

    superagent
        .delete("/administration/admin/lines/"+id)
        .end(function(err, res)
        {
            if (err || !res.ok)
            {
                errorToast("Erreur interne");
                Materialize.toast("Erreur interne", 2000);
            } else
            {
                refreshZoneLine(idZone);
                successToast("Line supprimée");
            }
        });
}

function refreshZoneLine(idZone) {
    $("#tab-zone-line-"+idZone).load(" #tab-zone-line-"+idZone);
}

function resetForm(selector) {
    $(selector)[0].reset();
}