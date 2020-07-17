const filterSchema = {
    groups: [{
            groupName: 'VehicleType',
            groupTitle: 'Выберите тип транспортного средства',
            groupType: 'radio',
            items: [{
                    name: 1,
                    title: "Седельный тягач"
                },
                {
                    name: 2,
                    title: "Полуприцеп-рефрижератор"
                },
                {
                    name: 3,
                    title: "Шторный полуприцеп"
                },
                {
                    name: 4,
                    title: "Бортовой полуприцеп"
                }
            ]
        },
        {
            groupName: 'year',
            groupTitle: 'Год выпуска',
            groupType: 'checkbox',
            items: [{
                    name: 2019,
                    title: "2019 г.в."
                },
                {
                    name: 2018,
                    title: "2018 г.в."
                },
                {
                    name: 2017,
                    title: "2017 г.в."
                },
                {
                    name: 2016,
                    title: "2016 г.в."
                },
                {
                    name: 2015,
                    title: "2015 г.в."
                }
            ]
        },
        {
            groupName: 'brand',
            groupTitle: 'Марка тягача',
            groupType: 'checkbox',
            disableForTrailers: true,
            items: [{
                    name: 'VOLVO',
                    title: 'Volvo',
                    dbName: 'Volvo'
                },
                {
                    name: 'SCANIA',
                    title: 'Scania',
                    dbName: 'Scania'
                },
                {
                    name: 'DAF',
                    title: 'DAF'
                },
                {
                    name: 'MERCEDES',
                    title: 'Mercedes-Benz',
                    dbName: 'Mercedes-Benz'
                },
                {
                    name: 'MAN',
                    title: 'MAN'
                }
            ]
        },
        {
            groupName: 'brand',
            groupTitle: 'Марка тягача',
            groupType: 'checkbox',
            disableForTrailers: true,
            items: [{
                    name: 'RENAULT',
                    title: 'Renault',
                    dbName: 'Renault'
                },
                {
                    name: 'IVECO',
                    title: 'IVECO'
                },
                {
                    name: 'KAMAZ',
                    title: 'КамАЗ',
                    dbName: 'КамАЗ'
                },
                {
                    name: 'MAZ',
                    title: 'МАЗ',
                    dbName: 'МАЗ'
                }
            ]
        },
        {
            groupName: 'formula',
            groupTitle: 'Колесная формула тягача',
            groupType: 'checkbox',
            disableForTrailers: true,
            items: [{
                    name: '4x2',
                    title: '4x2'
                },
                {
                    name: '6x2',
                    title: '6x2'
                },
                {
                    name: '6x4',
                    title: '6x4'
                },
                {
                    name: '6x6',
                    title: '6x6'
                },
                {
                    name: '8x8',
                    title: '8x8'
                }
            ]
        },
        {
            groupName: 'beds',
            groupTitle: 'Спальных мест в кабине тягача',
            groupType: 'checkbox',
            disableForTrailers: true,
            items: [{
                    name: '1',
                    title: '1 спальное место'
                },
                {
                    name: '2',
                    title: '2 спальных места'
                }
            ]
        },
        {
            groupName: 'federal_district',
            groupTitle: 'Федеральный округ',
            groupType: 'checkbox',
            items: [{
                    name: 'CFO',
                    title: 'Центральный ФО',
                    dbName: 'ЦФО'
                },
                {
                    name: 'SZFO',
                    title: 'Северо-Западный ФО',
                    dbName: 'СЗФО'
                },
                {
                    name: 'YUFO',
                    title: 'Южный ФО',
                    dbName: 'ЮФО'
                },
                {
                    name: 'PFO',
                    title: 'Поволжский ФО',
                    dbName: 'ПФО'
                },
                {
                    name: 'UFO',
                    title: 'Уральский ФО',
                    dbName: 'УФО'
                }
            ]
        },
        {
            groupName: 'fo',
            groupTitle: 'Федеральный округ',
            groupType: 'checkbox',
            items: [{
                    name: 'SFO',
                    title: 'Сибирский ФО',
                    dbName: 'СФО'
                },
                {
                    name: 'DVFO',
                    title: 'Дальневосточный ФО',
                    dbName: 'ДВФО'
                },
                {
                    name: 'SKFO',
                    title: 'Северокавказский ФО',
                    dbName: 'СКФО'
                },
                {
                    name: 'KFO',
                    title: 'Крымский ФО',
                    dbName: 'КФО'
                }
            ]
        },
        {
            groupName: 'leasingOnly',
            groupTitle: 'Только объявления с возможностью покупки в лизинг',
            groupType: 'checkbox',
            items: [{
                name: '',
                title: 'Только с возможностью лизинга'
            }]
        }
    ]
}

var selectedType;
var redrawAt = -1;
const REDRAW_DELAY = 1000;
var app;

var f = new Vue({
    el: '#form',
    data: filterSchema
})

filterChanged(0);

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

    $(".disableForTrailers").hide()

}

function trucksClicked() {
    $(".disableForTrailers .form-check-input").get().forEach(e => {
        e.disabled = false;
    })

    $(".disableForTrailers").show()

}

function filterChanged(delay) {
    if (delay > 0)
        history.pushState(null, null, '?' + $('#form').serialize());
    if (app)
        app.loading = true

    // анализируем VehicleType и устанавливаем переменную selected Type
    var s = location.search.match(/VehicleType=(\d*)/);
    selectedType = s && s.length > 0 ? Number(s[1] - 1) : 0;
    selectedType = (selectedType < 0) || (selectedType > 3) ? 0 : selectedType;
    $('[name=VehicleType]').get()[selectedType].checked = true;

    // обнулять и дизейблить фильтры, если выбраны полуприцепы
    if (selectedType > 0)
        trailersClicked()
    else
        trucksClicked()

    // устанавливаем чекбоксы на форме
    var checkboxes = Object.entries(getUrlVars()).filter(e => e[1] == "on");
    checkboxes.forEach(e => { $(`[name=${e[0]}]`).get()[0].checked = true; });

    //устанавливаем maxprice
    let mp = getUrlVars()["maxprice"]
    if (mp) {
        $("#maxprice")[0].value = mp
        adjustPriceLabel()
    }

    if (delay > 0) {
        redrawAt = Date.now() + delay - 1;
        setTimeout(function() {
            if (Date.now() > redrawAt) {
                updateTitle();
                requestData();
            }
        }, delay)
    } else
        updateTitle();
}

function updateTitle() {
    let t = ''; // заготовка для title

    if (selectedType == 0)
        t = 'Тягачи'
    else
        t = 'Полуприцепы'

    //добавляем бренд
    let b = location.search.match(/brand(\w*)/g)

    if (b) b.forEach((e, i) => {
        if (i == 0)
            t += ' ' + e.match(/brand(\w*)/)[1]
        else
            t += ', ' + e.match(/brand(\w*)/)[1]
    })

    if (location.search.match(/leasing/))
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
    requestData()
}