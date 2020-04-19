var selectedType;
var redrawAt = -1;

// анализируем VehicleType и устанавливаем переменную selected Type
var s = location.search.match(/VehicleType=(\d*)/);
selectedType = s && s.length > 0 ? Number(s[1] - 1) : 0;
selectedType = (selectedType < 0) || (selectedType > 3) ? 0 : selectedType;
$('[name=VehicleType]').get()[selectedType].checked = true;

// устанавливаем чекбоксы на форме
var checkboxes = Object.entries(getUrlVars()).filter(e => e[1] == "on");
checkboxes.forEach(e => { $(`[name=${e[0]}]`).get()[0].checked = true; });

//устанавливаем maxprice
let mp = getUrlVars()["maxprice"]
if (mp) {
    $("#maxprice")[0].value = mp
    adjustPriceLabel()
}

// обнулять и дизейблить фильтры, если выбраны полуприцепы
if (selectedType > 0)
    trailersClicked();

updateTitle();

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

function updateTitle() {
    let t = ''; // заготовка для title

    if (selectedType == 0)
        t = 'Тягачи'
    else
        t = 'Полуприцепы'

    //добавляем бренд
    window.location.href.match(/brand(\w*)/g).forEach((e, i) => {
        if (i == 0)
            t += ' ' + e.match(/brand(\w*)/)[1]
        else
            t += ', ' + e.match(/brand(\w*)/)[1]
    })

    if (window.location.href.match(/leasing/))
        t += ' в лизинг'

    t += ' по заниженным ценам'

    document.title = t;
}

function adjustPriceLabel() {
    $("#priceLabel")[0].innerText = Intl.NumberFormat("ru-ru").format(Number($("#maxprice")[0].value))
}

function clearFilters() {
    $('#form input:checkbox').prop('checked', false)
    $('#maxprice')[0].value = '10000000'
    $('#form').submit()
}