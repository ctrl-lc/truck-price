var selectedType;
var redrawAt = -1;

// VehicleType
var s = location.search.match(/VehicleType=(\d*)/);
selectedType = s && s.length > 0 ? Number(s[1] - 1) : 0;
selectedType = (selectedType < 0) || (selectedType > 3) ? 0 : selectedType;
$('[name=VehicleType]').get()[selectedType].checked = true;

// чекбоксы
var checkboxes = Object.entries(getUrlVars()).filter(e => e[1] == "on");
checkboxes.forEach(e => { $(`[name=${e[0]}]`).get()[0].checked = true; });

// обнулять и дизейблить фильтры, если выбраны полуприцепы
if (selectedType > 0)
    trailersClicked();

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function trailersClicked() {
    $(".disableForTrailers .form-check-input").get().forEach(e => {
        e.disabled = true;
        e.checked = false;
    })

    $(".disableForTrailers").get().forEach(e => {
        e.hidden = true;
    })

}

function trucksClicked() {
    $(".disableForTrailers .form-check-input").get().forEach(e => {
        e.disabled = false;
    })

    $(".disableForTrailers").get().forEach(e => {
        e.hidden = false;
    })

}

function filterChanged() {
    redrawAt = Date.now() + 2999;
    setTimeout(function() {
        if (Date.now() > redrawAt)
            $("#form").submit();
    }, 3000)
}