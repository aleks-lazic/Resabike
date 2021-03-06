$(document).ready(function(){
    $('#stepper-booking.stepper').activateStepper({
        linearStepsNavigation: false,
    });

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        monthsFull: [translation[$_LANG()].JANUARY, translation[$_LANG()].FEBRUARY, translation[$_LANG()].MARS, translation[$_LANG()].APRIL, translation[$_LANG()].MAY, translation[$_LANG()].JUNE, translation[$_LANG()].JULY, translation[$_LANG()].AUGUST, translation[$_LANG()].SEPTEMBER, translation[$_LANG()].OCTOBER, translation[$_LANG()].NOVEMBER, translation[$_LANG()].DECEMBER],
        weekdaysShort: [translation[$_LANG()].SUN, translation[$_LANG()].MON, translation[$_LANG()].TUES, translation[$_LANG()].WED, translation[$_LANG()].THURS, translation[$_LANG()].FRI, translation[$_LANG()].SAT],
        today: translation[$_LANG()].TODAY,
        clear: translation[$_LANG()].CANCEL,
        close: translation[$_LANG()].OK,
        closeOnSelect: true ,// Close upon selecting a date,
        format: 'mm/dd/yyyy',
        min:true

    });

    //HOURS
    $('.timepicker').pickatime({
        default: 'now', // Set default time: 'now', '1:30AM', '16:30'
        fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
        twelvehour: false, // Use AM/PM or 24-hour format
        donetext: translation[$_LANG()].OK, // text for done-button
        cleartext: translation[$_LANG()].CLEAR, // text for clear-button
        canceltext: translation[$_LANG()].CANCEL, // Text for cancel-button
        autoclose: false, // automatic close timepicker
        ampmclickable: true, // make AM PM clickable
        aftershow: function(){
            Materialize.updateTextFields();
        } //Function for after opening timepicker
    });

    $('.booking-button').on('click', function (e) {
        e.stopPropagation();
    })

})

/**
 * Get booking suggestions
 */
function getBookingSuggestions()
{
    var departure = $('#booking-register-departure').val();
    var terminal = $('#booking-register-terminal').val();
    var date = $('#booking-register-date').val();
    var time = $('#booking-register-time').val();

    superagent
        .post("/booking")
        .send({departure:departure, terminal:terminal, date:date, time:time})
        .end(function(err, res)
        {
            if (err || !res.ok)
            {
                $('#stepper-booking.stepper').destroyFeedback();
                errorToast(translation[$_LANG()].INTERNAL_ERROR+'</br>'+translation[$_LANG()].CORRECT_STOP);
            }
            else
            {
                console.log(res.body);
                buildSuggestions(res);
                successToast(translation[$_LANG()].DATA_UPDATE);
                $('#stepper-booking.stepper').nextStep();
            }
        });
}

/**
 * Create booking
 */
function createBooking() {

    var trip = $("#"+event.target.id).data("trip");
    event.stopPropagation();



    var personaldata = {
        firstname : $('#booking-register-firstname').val(),
        lastname : $('#booking-register-lastname').val(),
        group : $('#booking-register-group').val(),
        phone : $('#booking-register-phone').val(),
        email : $('#booking-register-email').val(),
        datetime : trip.datetime,
        nbBikes: $('#booking-register-bikes').val(),
        remark : $('#booking-register-email').val(),
        departure: trip.departure,
        arrival : trip.arrival
    }

    superagent
        .post("/booking/add")
        .send({personaldata: personaldata, trip:trip})
        .end(function(err, res)
        {
            if (err || !res.ok)
            {
                $('#stepper-booking.stepper').destroyFeedback();
                errorToast(translation[$_LANG()].INTERNAL_ERROR+'</br>'+translation[$_LANG()].CORRECT_STOP);
            }
            else
            {
                var resume = '<ul class="collection"><li class="collection-item ebony-clay white-text"><div class="choice"><i class="material-icons" style="vertical-align: middle">directions_bus</i>';

                for(var i = 0; i < trip.changes.length; i++)
                {
                    resume +=
                        '<span class="highlight-line">'+trip.changes[i].idLine+'</span>';
                }
                resume += ' ' + trip.departure + '<i class="material-icons direction">keyboard_arrow_right</i> ' + trip.arrival + ' <span class="not-highlight">' + trip.datetime + ' ' + trip.duration/60 + '\'</span><span class="register-bikes-available"><i class="material-icons register-bikes-available-icon">directions_bike</i>'+personaldata.nbBikes+' '+ translation[$_LANG()].BIKES+ '</span></div></ul></li> ';
                if(personaldata.nbBikes > trip.nbBikes)
                {
                    successToast(translation[$_LANG()].WAITINGBOOKING);
                    $('.confirmation-message').empty();
                    $('.confirmation-message').append("<p>" +translation[$_LANG()].AFTERBOOKING1 +" "+personaldata.firstname+" "+personaldata.lastname+",</p>" +
                        "<p>" + translation[$_LANG()].AFTERBOOKING2+ "</p>" +
                        "<p>" + translation[$_LANG()].AFTERBOOKING3+ " " +
                        "" +translation[$_LANG()].AFTERBOOKING4 +"</p><p>" +translation[$_LANG()].AFTERBOOKING5 +"</p>");
                    $('.resume').empty();
                    $('.resume').append(resume);
                }
                else
                {
                    successToast(translation[$_LANG()].BOOKINGSUCCESS);
                    $('.confirmation-message').empty();
                    $('.confirmation-message').append("<p>"+ translation[$_LANG()].BOOKINGSUCCESS1 + " "+personaldata.firstname+" "+personaldata.lastname+",</p>" +
                        '<p> ' + translation[$_LANG()].BOOKINGSUCCESS2 + ' '  +
                        ' ' + translation[$_LANG()].BOOKINGSUCCESS3 + ' '+personaldata.email+'</p><p> ' + translation[$_LANG()].BOOKINGSUCCESS4 + ' </p>');
                    $('.resume').empty();
                    $('.resume').append(resume);
                }

                setTimeout("$('#stepper-booking.stepper').nextStep();", 2000);

            }
        });
}

/**
 * Build suggestions list
 * @param res
 */
function buildSuggestions(res) {
    var suggestions = "";

    for(var i = 0; i < res.body.length; i++)
    {
        if(res.body[i].changes.length != 0)
        {
            var stops = "";
            var suggestion = res.body[i];
            var data = JSON.stringify(suggestion).replace(/'/g, "\\'");
            suggestions += '<li data-id="'+i+'"><div class="collapsible-header"><div class="choice"><i class="material-icons" style="vertical-align: middle">directions_bus</i>';

            console.log(suggestion);
            if(suggestion.changes.length > 1)
                for(var j = 0; j < suggestion.changes.length; j++)
                {
                    suggestions += ' <span class="highlight-line">'+suggestion.changes[j].idLine+'</span>';
                    var startTime = suggestion.changes[j].departureTime.split(' ')[1].split(':')[0]+":"+suggestion.changes[j].departureTime.split(' ')[1].split(':')[1];

                        if(j != suggestion.changes.length - 1)

                            stops +='<li>'+suggestion.changes[j].departureStation+'</br><span class="light-hour"> '+startTime+' </span></li>';
                        else
                        {
                            var exitTime = suggestion.changes[j].exitTime.split(' ')[1].split(':')[0]+":"+suggestion.changes[j].exitTime.split(' ')[1].split(':')[1];
                            var previousExitTime = suggestion.changes[j-1].exitTime.split(' ')[1].split(':')[0]+":"+suggestion.changes[j-1].exitTime.split(' ')[1].split(':')[1];
                            stops += '<li>'+suggestion.changes[j].departureStation+'</br><span class="light-hour"> '+previousExitTime+'-'+ startTime +' </span></li><li>'+suggestion.changes[j].exitStation+'</br><span class="light-hour"> '+exitTime+' </span></li>';
                        }
                }
            else if(suggestion.changes.length == 1)
            {
                suggestions += ' <span class="highlight-line">'+suggestion.changes[0].idLine+'</span>';
                var startTime = suggestion.changes[0].departureTime.split(' ')[1].split(':')[0]+":"+suggestion.changes[0].departureTime.split(' ')[1].split(':')[1];
                var exitTime = suggestion.changes[0].exitTime.split(' ')[1].split(':')[0]+":"+suggestion.changes[0].exitTime.split(' ')[1].split(':')[1];
                stops += '<li>'+suggestion.changes[0].departureStation+'</br><span class="light-hour"> '+ startTime +' </span></li><li>'+suggestion.changes[0].exitStation+'</br><span class="light-hour"> '+exitTime+' </span></li>';
            }

            var duration = suggestion.duration / 60;
            var available = "";

            if(suggestion.nbBikes == 0)
                available = "red-text";

            suggestions += ' ' + suggestion.departure + '<i class="material-icons direction">keyboard_arrow_right</i> ' + suggestion.arrival + ' <span class="not-highlight">' + suggestion.datetime + ' ' + duration + '\'</span><span class="register-bikes-available '+available+'"><i class="material-icons register-bikes-available-icon">directions_bike</i>'+suggestion.nbBikes+''+ translation[$_LANG()].PLACE +'</span></div>' +
                '<button class="waves-effect waves-light btn booking-button" id="booking-button-'+i+'" data-trip=\''+data+'\' data-feedback="createBooking">' + translation[$_LANG()].BOOK + '<i class="material-icons left">timeline</i></button></div>' +
                '<div class="collapsible-body"><span><ol class="line-stops">'+stops+'</ol></span></div></li>';
        }



    }

    $('ul.collapsible.suggestions').empty();
    $('ul.collapsible.suggestions').append(suggestions);

}

/**
 * Destroy loading page
 */
function newBooking() {
    $('#stepper-booking.stepper').destroyFeedback();
    $('#stepper-booking.stepper').resetStepper();
}